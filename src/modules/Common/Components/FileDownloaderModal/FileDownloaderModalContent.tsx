import React, { useMemo, useState } from 'react';
import moment from 'moment';
import { FileLink, IdEither } from '@cognite/sdk';
import sdk from '@cognite/cdf-sdk-singleton';
import { Dropdown, Menu, Title, Button, Body, Radio } from '@cognite/cogs.js';
import { saveAs } from 'file-saver';
import { STATUS } from 'src/modules/Common/Components/FileUploaderModal/enums';
import styled from 'styled-components';
import JSZip from 'jszip';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';
import { ToastUtils } from 'src/utils/ToastUtils';
import { makeSelectAnnotationsForFileIds } from 'src/modules/Common/store/annotation/selectors';
import { renameDuplicates } from 'src/modules/Common/Components/FileUploader/utils/FileUtils';
import { getDownloadControls } from './DownloadControlButtons';
import {
  AnnotationChoice,
  AnnotationFileFormat,
  DownloadChoice,
  FileDownloaderModalProps,
} from './types';
import {
  convertAnnotationsToAutoML,
  convertAnnotationsToCOCO,
} from './annotationConverters';

export const FileDownloaderModalContent = ({
  fileIds,
  onCancel,
}: FileDownloaderModalProps) => {
  const [currentAnnotationFileFormat, setCurrentAnnotationFileFormat] =
    useState<AnnotationFileFormat>(AnnotationFileFormat.CSV);
  const [currentAnnotationChoice, setCurrentAnnotationChoice] =
    useState<AnnotationChoice>(AnnotationChoice.VerifiedAndUnreviewed);
  const [currentFileChoice, setCurrentFileChoice] = useState<DownloadChoice>(
    DownloadChoice.Files
  );
  const [downloadStatus, setDownloadStatus] = useState<STATUS>(
    STATUS.READY_TO_START
  );
  const [hideDropDown, setHideDropDown] = useState<boolean>(true);
  const [downloadedMessage, setDownloadedMessage] = useState<string>('0%');
  const selectAnnotationsForFileIds = useMemo(
    makeSelectAnnotationsForFileIds,
    []
  );
  const annotations = useSelector(({ annotationReducer }: RootState) =>
    selectAnnotationsForFileIds(annotationReducer, fileIds)
  );

  const annotationStatusMap = () => {
    if (currentAnnotationChoice === AnnotationChoice.OnlyRejected) {
      return [AnnotationStatus.Rejected];
    }
    if (currentAnnotationChoice === AnnotationChoice.VerifiedAndUnreviewed) {
      return [AnnotationStatus.Verified, AnnotationStatus.Unhandled];
    }
    return [
      AnnotationStatus.Verified,
      AnnotationStatus.Unhandled,
      AnnotationStatus.Rejected,
    ];
  };

  const downloadFiles = async () => {
    const batchSize = 100;

    const files = await sdk.files.retrieve(
      fileIds.map((id) => {
        return {
          id,
        };
      }) as IdEither[]
    );
    const zip = new JSZip();
    const zipfilename = `fusion-download-${moment().format()}`;
    if (
      [DownloadChoice.Annotations, DownloadChoice.FilesAndAnnotations].includes(
        currentFileChoice
      )
    ) {
      if (currentAnnotationFileFormat === AnnotationFileFormat.CSV) {
        const [annotationFilename, annotationFileBlob] =
          await convertAnnotationsToAutoML(
            files,
            annotations,
            annotationStatusMap()
          );
        zip.file(annotationFilename as string, annotationFileBlob);
      } else if (currentAnnotationFileFormat === AnnotationFileFormat.COCO) {
        const [annotationFilename, annotationFileBlob] =
          await convertAnnotationsToCOCO(
            files,
            annotations,
            annotationStatusMap()
          );
        zip.file(annotationFilename as string, annotationFileBlob);
      }
    }
    if (
      [DownloadChoice.Files, DownloadChoice.FilesAndAnnotations].includes(
        currentFileChoice
      )
    ) {
      const batchFileIdsList: number[][] = fileIds.reduce((acc, _, i) => {
        if (i % batchSize === 0) {
          acc.push(fileIds.slice(i, i + batchSize));
        }
        return acc;
      }, [] as number[][]);

      const getBlobs = async (batch: number[], batchId: number) => {
        const req = batch.map((id) => {
          return {
            id,
          };
        });

        const data = await sdk
          .post(
            // call post directly since getDownloadUrls() does not support extendedExpiration
            `/api/v1/projects/${sdk.project}/files/downloadlink`,
            {
              data: { items: req },
              params: { extendedExpiration: true },
            }
          )
          .then((response) => response.data.items as (FileLink & IdEither)[]);

        const uniqueFilenames = renameDuplicates(files.map((f) => f.name));
        let i = 0;
        await Promise.all(
          data.map((item, index) => {
            return fetch(item.downloadUrl, {
              method: 'GET',
            }).then((value) => {
              i += 1; // index values are not ordered, thus use another counter variable
              const currentFileCount = batchId + i;
              setDownloadedMessage(
                `${Math.round(
                  (currentFileCount / fileIds.length) * 100
                ).toString()}%`
              );
              zip.file(uniqueFilenames[index + batchId], value.blob());
            });
          })
        );
      };
      for (let i = 0; i < batchFileIdsList.length; i++) {
        const batchId = i * batchSize;
        const batch = batchFileIdsList[i];
        try {
          // eslint-disable-next-line no-await-in-loop
          await getBlobs(batch, batchId);
        } catch (error) {
          ToastUtils.onFailure(`Failed to download files ${error?.message}`);
          console.error(`Failed to download files ${error?.message}`);
          setDownloadStatus(STATUS.READY_TO_START);
          return undefined;
        }
      }
    }
    // Files are fetched and downloaded, now zip the file
    setDownloadedMessage('zipping files...');
    try {
      await zip.generateAsync({ type: 'blob' }).then(
        (content: Blob | string) => {
          saveAs(content, `${zipfilename}.zip`);
        },
        (error: string) => {
          console.error(`Failed to zip files ${error}`);
        }
      );
      setDownloadStatus(STATUS.DONE);
      onCancel();
      setDownloadStatus(STATUS.READY_TO_START);
      setDownloadedMessage('0%');

      return 'success';
    } catch (error) {
      ToastUtils.onFailure(`Failed to download files ${error?.message}`);
      console.error(`Failed to download files ${error?.message}`);
      return undefined;
    }
  };

  // TODO: Add cancel download
  //   const { confirm } = Modal;
  //   const stopDownload = () => {
  //     confirm({
  //       title: 'Do you want to cancel the download?',
  //       content: 'If you cancel, the file upload will be cancelled!',
  //       onOk: () => {},
  //     });
  //   };

  const onDownloadStart = () => {
    if (fileIds) {
      setDownloadStatus(STATUS.STARTED);
      downloadFiles();
    }
  };

  const [DownloadButton, CancelButton] = getDownloadControls(
    downloadStatus,
    onDownloadStart,
    downloadedMessage
  );

  const FileMenuContent = (
    <Menu
      style={{
        color: 'black' /* typpy styles make color to be white here ... */,
      }}
    >
      <Menu.Item
        onClick={() => {
          setCurrentFileChoice(DownloadChoice.Files);
          setHideDropDown(true);
        }}
        disabled={false}
      >
        Files: {DownloadChoice.Files}
      </Menu.Item>

      <Menu.Item
        onClick={() => {
          setCurrentFileChoice(DownloadChoice.Annotations);
          setHideDropDown(true);
        }}
        disabled={false}
      >
        Files: {DownloadChoice.Annotations}
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          setCurrentFileChoice(DownloadChoice.FilesAndAnnotations);
          setHideDropDown(true);
        }}
      >
        Files: {DownloadChoice.FilesAndAnnotations}
      </Menu.Item>
    </Menu>
  );

  const AnnotationMenuContent = (
    <Menu
      style={{
        color: 'black' /* typpy styles make color to be white here ... */,
      }}
    >
      <Menu.Item
        onClick={() => setCurrentAnnotationFileFormat(AnnotationFileFormat.CSV)}
      >
        As: {AnnotationFileFormat.CSV}
      </Menu.Item>
      <Menu.Item
        onClick={() =>
          setCurrentAnnotationFileFormat(AnnotationFileFormat.COCO)
        }
      >
        As: {AnnotationFileFormat.COCO}
      </Menu.Item>
    </Menu>
  );

  const handleAnnotationRadioButton = (e?: string) => {
    if (e === AnnotationChoice.VerifiedAndUnreviewed) {
      setCurrentAnnotationChoice(AnnotationChoice.VerifiedAndUnreviewed);
    } else if (e === AnnotationChoice.OnlyRejected) {
      setCurrentAnnotationChoice(AnnotationChoice.OnlyRejected);
    } else if (e === AnnotationChoice.All) {
      setCurrentAnnotationChoice(AnnotationChoice.All);
    }
  };

  const AnnotationRadio = () => {
    return (
      <>
        <Radio
          id="1"
          name="annotationSelection"
          value={AnnotationChoice.VerifiedAndUnreviewed}
          checked={
            currentAnnotationChoice === AnnotationChoice.VerifiedAndUnreviewed
          }
          disabled={currentFileChoice === DownloadChoice.Files}
          onChange={(isChecked, e) => handleAnnotationRadioButton(e)}
          style={{ paddingTop: '10px' }}
        >
          {AnnotationChoice.VerifiedAndUnreviewed}
        </Radio>
        <Radio
          id="2"
          name="annotationSelection"
          value={AnnotationChoice.OnlyRejected}
          checked={currentAnnotationChoice === AnnotationChoice.OnlyRejected}
          disabled={currentFileChoice === DownloadChoice.Files}
          onChange={(isChecked, e) => handleAnnotationRadioButton(e)}
        >
          {AnnotationChoice.OnlyRejected}
        </Radio>
        <Radio
          id="3"
          name="annotationSelection"
          value={AnnotationChoice.All}
          checked={currentAnnotationChoice === AnnotationChoice.All}
          disabled={currentFileChoice === DownloadChoice.Files}
          onChange={(isChecked, e) => handleAnnotationRadioButton(e)}
        >
          {AnnotationChoice.All}
        </Radio>
      </>
    );
  };

  return (
    <>
      <Title level={3} as="p">
        Download from CDF
      </Title>
      <DownloadContainer>
        <Text level={2} style={{ paddingTop: '17px', paddingBottom: '17px' }}>
          {fileIds.length} files selected for download
        </Text>
        <Title level={5}>Download files </Title>
        <Dropdown content={FileMenuContent} visible={!hideDropDown}>
          <Button
            type="tertiary"
            // type="ghost"
            aria-label="dropdown file selection"
            icon="ChevronDownCompact"
            iconPlacement="right"
            onClick={() => {
              setHideDropDown(false);
            }}
          >
            <Body level={2} style={{ color: '#8C8C8C' }}>
              Files: {currentFileChoice}
            </Body>
          </Button>
        </Dropdown>

        <Title level={5} style={{ paddingTop: '17px' }}>
          Download annotations
        </Title>

        <Dropdown content={AnnotationMenuContent}>
          <Button
            type="tertiary"
            aria-label="dropdown file selection"
            icon="ChevronDownCompact"
            iconPlacement="right"
            disabled={currentFileChoice === DownloadChoice.Files}
          >
            <Body level={2} style={{ color: '#8C8C8C' }}>
              As: {currentAnnotationFileFormat}
            </Body>
          </Button>
        </Dropdown>

        <AnnotationRadio />
        <Footer>
          {CancelButton}
          {DownloadButton}
        </Footer>
      </DownloadContainer>
    </>
  );
};

const DownloadContainer = styled.div`
  display: grid;
  grid-template-rows: repeat(1fr, 9);
  gap: 8px;
`;

const Text = styled(Body)`
  color: #8c8c8c;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: flex-end;
  margin: 39px 0 0 0;
`;
