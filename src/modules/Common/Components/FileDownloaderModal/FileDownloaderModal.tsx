import React, { useState } from 'react';
import { Modal } from 'antd';
import { getContainer, getTimeStringNow } from 'src/utils';
import {
  CogniteClient,
  FileInfo,
  v3Client as sdk,
} from '@cognite/cdf-sdk-singleton';
import { Dropdown, Menu, Title, Button, Body } from '@cognite/cogs.js';
import { saveAs } from 'file-saver';
import styled from 'styled-components';
import JSZip from 'jszip';
import { CogsFileInfo } from '../FileUploader/FilePicker/types';
import { getDownloadControls } from './DownloadControlButtons';
import { STATUS } from '../FileUploaderModal/enums';

export type ModalFileDownloaderProps = {
  initialDownloadedFiles?: FileInfo[];
  fileIds?: number[];
  enableProcessAfter?: boolean;
  onDownloadSuccess?: (fileIds: number[]) => void;
  onFileListChange?: (fileList: CogsFileInfo[]) => void;
  onDownloadFailure?: (error: string) => void;
  onCancel?: () => void;
  beforeDownloadStart?: (fileList: CogsFileInfo[]) => void;
};

export type FileDownloaderModalProps = ModalFileDownloaderProps & {
  showModal: boolean;
  onCancel: () => void;
};

export const FileDownloaderModal = (props: FileDownloaderModalProps) => {
  return (
    <Modal
      getContainer={getContainer}
      visible={props.showModal}
      onCancel={props.onCancel}
      width={600}
      footer={null} // to remove default ok and cancel buttons
      bodyStyle={{
        backgroundColor: '#ffffff',
        border: '1px solid #cccccc',
        borderRadius: '5px',
        padding: '28px',
      }}
    >
      <ModalFileDownloader {...props} />
    </Modal>
  );
};

// enum AnnotationType {
//   CSV = 'CSV (Google AutoML)',
//   TXT = 'TXT (YOLO Darknet)',
//   XML = 'XML (Pascal VOC)',
// }
// enum AnnotationChoice {
//   VerifiedAndUnreviewed = 'Only verified and unreviewed annotations',
//   OnlyRejected = 'Only rejected annotations',
//   All = 'All annotations (including rejected)',
// }
enum DownloadChoice {
  Files = 'Images Only',
  FilesAndAnnotations = 'Images and annotations',
}

export const ModalFileDownloader = ({
  fileIds,
  onCancel = () => {},
  onDownloadSuccess = () => {},
  onDownloadFailure = () => {},
}: ModalFileDownloaderProps) => {
  // const [currentAnnotationTypeChoice, setCurrentAnnotationTypeChoice] =
  //   useState<AnnotationType>(AnnotationType.CSV);
  // const [currentAnnotationChoice, setCurrentAnnotationChoice] =
  //   useState<AnnotationChoice>(AnnotationChoice.VerifiedAndUnreviewed);
  const [currentFileChoice, setCurrentFileChoice] = useState<DownloadChoice>(
    DownloadChoice.Files
  );

  const [downloadStatus, setDownloadStatus] = useState<STATUS>(
    STATUS.READY_TO_START
  );

  const selectedCount = fileIds?.length;

  const downloadImages = async (client: CogniteClient, files: number[]) => {
    const req: { id: number }[] = [];
    files.forEach((file) => {
      req.push({ id: file });
    });

    try {
      const result = await client.files.getDownloadUrls(req);
      const zip = new JSZip();
      const promises: Promise<Blob>[] = [];
      result.forEach((d) => {
        const promise = fetch(d.downloadUrl, { method: 'GET' }).then((value) =>
          value.blob()
        );
        promises.push(promise);
      });
      const data = Promise.all(promises);
      let count = 0;
      (await data).forEach((el: Blob) => {
        zip.file(`img-${count}.${el.type.split('/')[1]}`, el);
        count++;
      });

      const zipfilename = `Vision-DL-${getTimeStringNow()}`;
      zip.generateAsync({ type: 'blob' }).then(
        (content: Blob | string) => {
          saveAs(content, `${zipfilename}.zip`);
          onDownloadSuccess(files);
        },
        (err: string) => {
          onDownloadFailure(err);
        }
      );
      setDownloadStatus(STATUS.DONE);
      return 'success';
    } catch {
      // eslint-disable-next-line no-console
      console.log('Could not fetch file');
      return undefined;
    }
  };
  const { confirm } = Modal;

  const stopDownload = () => {
    confirm({
      title: 'Do you want to cancel the download?',
      content: 'If you cancel, the file upload will be cancelled!',
      onOk: () => {
        onCancel();
      },
    });
  };

  const onFinish = () => {
    onCancel();
    setDownloadStatus(STATUS.READY_TO_START);
  };

  const onDownloadStart = () => {
    if (fileIds) {
      setDownloadStatus(STATUS.STARTED);
      const _ = downloadImages(sdk, fileIds);
    }
  };

  const [DownloadButton, CancelButton] = getDownloadControls(
    downloadStatus,
    onDownloadStart,
    onFinish,
    stopDownload
  );

  const FileMenuContent = (
    <Menu
      style={{
        color: 'black' /* typpy styles make color to be white here ... */,
      }}
    >
      <Menu.Item
        onClick={() => setCurrentFileChoice(DownloadChoice.FilesAndAnnotations)}
        disabled
      >
        Files: {DownloadChoice.FilesAndAnnotations}
      </Menu.Item>
      <Menu.Item
        onClick={() => setCurrentFileChoice(DownloadChoice.Files)}
        disabled={false}
      >
        Files: {DownloadChoice.Files}
      </Menu.Item>
    </Menu>
  );

  // const AnnotationMenuContent = (
  //   <Menu
  //     style={{
  //       color: 'black' /* typpy styles make color to be white here ... */,
  //     }}
  //   >
  //     <Menu.Item
  //       onClick={() => setCurrentAnnotationTypeChoice(AnnotationType.CSV)}
  //     >
  //       As: {AnnotationTypeCSV]}
  //     </Menu.Item>
  //     <Menu.Item
  //       disabled
  //       onClick={() => setCurrentAnnotationTypeChoice(AnnotationType.TXT)}
  //     >
  //       As: {AnnotationTypeTXT]}
  //     </Menu.Item>
  //     <Menu.Item
  //       disabled
  //       onClick={() => setCurrentAnnotationTypeChoice(AnnotationType.XML)}
  //     >
  //       As: {AnnotationTypeXML]}
  //     </Menu.Item>
  //   </Menu>
  // );

  // const handleAnnotationRadioButton = (e: string) => {
  //   if (e === AnnotationChoice.VerifiedAndUnreviewed) {
  //     setCurrentAnnotationChoice(AnnotationChoice.VerifiedAndUnreviewed);
  //   } else if (e === AnnotationChoice.OnlyRejected) {
  //     setCurrentAnnotationChoice(AnnotationChoice.OnlyRejected);
  //   } else if (e === AnnotationChoice.All) {
  //     setCurrentAnnotationChoice(AnnotationChoice.All);
  //   }
  // };

  // const AnnotationRadio = () => {
  //   return (
  //     <>
  //       <Radio
  //         id="1"
  //         name="annotationSelection"
  //         value={AnnotationChoice.VerifiedAndUnreviewed}
  //         checked={
  //           currentAnnotationChoice === AnnotationChoice.VerifiedAndUnreviewed
  //         }
  //         disabled={currentFileChoice === DownloadChoice.Files}
  //         onChange={(e) => handleAnnotationRadioButton(e)}
  //       >
  //         {AnnotationChoice.VerifiedAndUnreviewed}
  //       </Radio>
  //       <Radio
  //         id="2"
  //         name="annotationSelection"
  //         value={AnnotationChoice.OnlyRejected}
  //         checked={currentAnnotationChoice === AnnotationChoice.OnlyRejected}
  //         disabled={currentFileChoice === DownloadChoice.Files}
  //         onChange={(e) => handleAnnotationRadioButton(e)}
  //       >
  //         {AnnotationChoice.OnlyRejected}
  //       </Radio>
  //       <Radio
  //         id="3"
  //         name="annotationSelection"
  //         value={AnnotationChoice.All}
  //         checked={currentAnnotationChoice === AnnotationChoice.All}
  //         disabled={currentFileChoice === DownloadChoice.Files}
  //         onChange={(e) => handleAnnotationRadioButton(e)}
  //       >
  //         {AnnotationChoice.All}
  //       </Radio>
  //     </>
  //   );
  // };

  return (
    <>
      <Title level={3} as="p">
        Download from CDF
      </Title>
      <DownloadContainer>
        <Text level={2}>{selectedCount} files selected for download</Text>
        <Title level={5}>Download files </Title>
        <Dropdown content={FileMenuContent}>
          <Button
            type="tertiary"
            // type="ghost"
            aria-label="dropdown file selection"
            icon="Down"
            iconPlacement="right"
          >
            File:
            <div style={{ fontWeight: 400, marginLeft: '5px' }}>
              {currentFileChoice}
            </div>
          </Button>
        </Dropdown>

        {/* <Title level={5}>Download annotations</Title>

        <Dropdown disabled content={AnnotationMenuContent}>
          <Button
            type="tertiary"
            // type="ghost"
            aria-label="dropdown file selection"
            icon="Down"
            iconPlacement="right"
            disabled={currentFileChoice === DownloadChoice.Files}
          >
            As:
            <div style={{ fontWeight: 400, marginLeft: '5px' }}>
              {currentAnnotationTypeChoice}
            </div>
          </Button>
        </Dropdown>

        <AnnotationRadio /> */}
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
  margin: 39px 0px 0px 0px;
`;
