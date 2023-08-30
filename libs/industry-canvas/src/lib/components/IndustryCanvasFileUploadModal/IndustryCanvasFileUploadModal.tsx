import { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';

import {
  Body,
  Checkbox,
  InputExp,
  Modal,
  OptionType,
  Select,
  toast,
} from '@cognite/cogs.js';
import { DataSet, FileGeoLocation, FileInfo } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';
import { useInfiniteList } from '@cognite/sdk-react-query-hooks';
import { isSupportedFileInfo } from '@cognite/unified-file-viewer';

import { translationKeys } from '../../common';
import { TOAST_POSITION } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';
import { setIsFileUploadModalOpen } from '../../state/useIndustrialCanvasStore';
import convertFileToArrayBuffer from '../../utils/convertFileToArrayBuffer';
import parseExif, { ExifTags } from '../../utils/parseExif';

const FILE_UPLOAD_SOURCE = 'COGNITE_INDUSTRY_CANVAS';

enum FileUploadModalState {
  IDLE = 'idle',
  UPLOADING = 'uploading',
  UNSUPPORTED_FILE_TYPE = 'unsupported_file_type',
}

type DataSetOption = { label: string; value: number };

export type FileUploadData = {
  file: File | undefined;
  relativePointerPosition: { x: number; y: number };
};

type IndustryCanvasFileUploadModalProps = {
  fileUploadData: FileUploadData | null;
  onCancel: () => void;
  onOk: (
    fileInfo: FileInfo,
    relativePointerPosition: { x: number; y: number }
  ) => void;
};

const IndustryCanvasFileUploadModal: React.FC<
  IndustryCanvasFileUploadModalProps
> = ({ fileUploadData, onOk, onCancel }) => {
  const sdk = useSDK();

  const [modalState, setModalState] = useState<FileUploadModalState>(
    FileUploadModalState.IDLE
  );
  const { t } = useTranslation();
  const [fileName, setFileName] = useState('');
  const [dataSetOptions, setDataSetOptions] = useState<DataSetOption[]>([]);
  const [selectedDataSet, setSelectedDataSet] = useState<
    OptionType<DataSetOption['value']> | undefined
  >();

  const { data } = useInfiniteList<DataSet>('datasets', 1000);
  const dataSets = useMemo(
    () => data?.pages?.flatMap((page) => page.items) || [],
    [data]
  );

  const [exifData, setExifData] = useState<{
    geoLocation?: FileGeoLocation;
    exifTags?: ExifTags;
  } | null>(null);
  const [shouldExtractEXIFData, setShouldExtractEXIFData] = useState(true);

  const resetState = () => {
    setFileName('');
    setSelectedDataSet(undefined);
    setShouldExtractEXIFData(true);
    setModalState(FileUploadModalState.IDLE);
    setExifData(null);
    setIsFileUploadModalOpen(false);
  };

  useEffect(() => {
    setDataSetOptions(
      dataSets.map((dataSet) => ({
        label: dataSet.name ?? String(dataSet.id),
        value: dataSet.id,
      }))
    );
  }, [dataSets]);

  const file = fileUploadData?.file;

  useEffect(() => {
    if (file === undefined) {
      return;
    }

    setIsFileUploadModalOpen(true);

    const isSupported = isSupportedFileInfo({
      mimeType: file.type,
      name: file.name,
    });
    if (!isSupported) {
      setModalState(FileUploadModalState.UNSUPPORTED_FILE_TYPE);
      return;
    }

    setFileName(file.name);
    setModalState(FileUploadModalState.IDLE);
  }, [file]);

  useEffect(() => {
    const loadExifData = async () => {
      if (file === undefined) {
        setExifData(null);
        return;
      }

      const parsedExifData = await parseExif(file);
      setExifData(parsedExifData);
    };

    loadExifData();
  }, [file, shouldExtractEXIFData]);

  if (file === undefined) {
    return <></>;
  }

  const handleCancel = () => {
    onCancel();
    setIsFileUploadModalOpen(false);
  };

  if (modalState === FileUploadModalState.UNSUPPORTED_FILE_TYPE) {
    return (
      <Modal
        visible={true}
        title="Unsupported file type"
        onCancel={handleCancel}
        hideFooter={true}
      >
        <Body>
          The file type <b>{file.type}</b> is not supported.
        </Body>
      </Modal>
    );
  }

  const handleOk = async () => {
    if (fileUploadData === null) {
      return;
    }

    try {
      setModalState(FileUploadModalState.UPLOADING);

      const arrayBuffer = await convertFileToArrayBuffer(file);

      const { geoLocation, exifTags } = exifData ?? {};
      const metadata = exifTags === undefined ? undefined : exifTags;

      const fileInfo = await sdk.files.upload(
        {
          name: fileName,
          mimeType: file.type,
          source: FILE_UPLOAD_SOURCE,
          dataSetId: selectedDataSet?.value,
          metadata: metadata as any, // The SDK handles int and floats in the metadata just fine, but the type definition does not allow it
          geoLocation: geoLocation,
        },
        arrayBuffer
      );
      onOk(fileInfo, fileUploadData.relativePointerPosition);
    } catch (error) {
      console.error(error);
      toast.error(
        <div>
          <h4>Unable to upload file</h4>
          <p>Try again later or contact support if the issue persists.</p>
        </div>,
        {
          toastId: 'industry-canvas-unable-to-upload-file',
          position: TOAST_POSITION,
        }
      );
      handleCancel();
    }
    resetState();
  };

  const shouldShowImagePreview = file.type.startsWith('image/');
  const shouldShowExifToggle =
    exifData !== null &&
    (exifData.exifTags !== undefined || exifData.geoLocation !== undefined);

  return (
    <Modal
      visible={true}
      title={t(translationKeys.MODAL_TITLE_FILE_UPLOAD, 'Upload to CDF')}
      onCancel={handleCancel}
      onOk={handleOk}
      icon={
        modalState === FileUploadModalState.UPLOADING ? 'Loader' : undefined
      }
      okText="Upload"
      okDisabled={modalState === FileUploadModalState.UPLOADING}
    >
      <Body level={2}>
        {shouldShowImagePreview && (
          <Centered>
            <StyledImg src={URL.createObjectURL(file)} alt="File preview" />
          </Centered>
        )}

        <StyledInputExp
          label={t(translationKeys.INPUT_FILENAME_FILE_UPLOAD, 'File name')}
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          fullWidth
        />

        <StyledSelect
          inputId="select-dataset"
          label={t(
            translationKeys.SELECT_DATASET_FILE_UPLOAD,
            'Select dataset'
          )}
          options={dataSetOptions}
          value={selectedDataSet}
          // Only setting this to true to avoid a bug in the Select component. Currently, it is not possible to
          // deselect the selected option if isMulti is false. Tracked by: https://cognitedata.atlassian.net/browse/CDS-1526
          isMulti={true}
          onChange={(value: OptionType<DataSetOption['value']>[]) => {
            setSelectedDataSet(value.at(-1));
          }}
        />

        {shouldShowExifToggle && (
          <StyledCheckbox
            label={t(
              translationKeys.CHECKBOX_EXIF_FILE_UPLOAD,
              'Extract EXIF-data from file'
            )}
            checked={shouldExtractEXIFData}
            onChange={(e) => setShouldExtractEXIFData(e.target.checked)}
          />
        )}
      </Body>
    </Modal>
  );
};

const Centered = styled.div`
  display: flex;
  justify-content: center;
`;

const StyledImg = styled.img`
  max-width: 400px;
  max-height: 400px;
`;

// Ideally we would add a flex container wrapper with `flex-direction: column` and a gap,
// but I get some styling issues doing that (unwanted scroll-bar, the width of the InputExp and Checkbox is not correct).
const StyledInputExp = styled(InputExp)`
  margin-bottom: 16px;
`;

const StyledSelect = styled(Select)`
  margin-bottom: 16px;
`;

const StyledCheckbox = styled(Checkbox)`
  margin-bottom: 16px;
`;

export default IndustryCanvasFileUploadModal;
