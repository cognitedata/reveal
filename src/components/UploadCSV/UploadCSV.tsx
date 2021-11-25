import React, { useState } from 'react';

import { UploadChangeParam } from 'antd/lib/upload';
import { notification, Upload } from 'antd';
import { Colors, Detail, Flex, Graphic, Title } from '@cognite/cogs.js';

import { getContainer } from 'utils/utils';
import { useCSVUpload } from 'hooks/csv-upload';
import { UPLOAD_MODAL_WIDTH } from 'utils/constants';

import Modal from 'components/Modal/Modal';
import { ModalProgress } from './ModalProgress';
import { ModalChooseKey } from './ModalChooseKey';

const { Dragger } = Upload;

interface UploadCsvProps {
  setCSVModalVisible(value: boolean, tableChanged?: boolean): void;
}

const UploadCSV = ({ setCSVModalVisible }: UploadCsvProps) => {
  const [file, setFile] = useState<File | undefined>();
  const [selectedKeyIndex, setSelectedKeyIndex] = useState<number>(-1);
  const {
    parsePercentage,
    uploadPercentage,
    uploadSize,
    columns,
    isUpload,
    isUploadCompleted,
    isParsing,
    onConfirmUpload,
  } = useCSVUpload(file, selectedKeyIndex);

  const okText = isUploadCompleted ? 'OK' : 'Add';

  const fileProps = {
    name: 'file',
    accept: '.csv',
    multiple: false,
    handleManualRemove() {
      setFile(undefined);
    },
    onChange(info: UploadChangeParam) {
      setFile(info.file.originFileObj);
    },
  };

  const renderModalContent = () => {
    if (file) {
      if (isUpload || isUploadCompleted) {
        return (
          <ModalProgress
            isUploadFinished={isUploadCompleted}
            parsePercentage={parsePercentage}
            uploadPercentage={uploadPercentage}
            uploadSize={uploadSize}
          />
        );
      }
      return (
        <ModalChooseKey
          columns={columns}
          selectedKeyIndex={selectedKeyIndex}
          setSelectedKeyIndex={setSelectedKeyIndex}
        />
      );
    }
    return (
      <Dragger {...fileProps}>
        <Flex justifyContent="center">
          <p className="ant-upload-drag-icon">
            <Graphic type="CSV" />
          </p>
        </Flex>
        <Title level={6}>Add CSV file here.</Title>
        <Detail style={{ color: Colors['greyscale-grey6'].hex() }}>
          Drag and drop, or click to select.
        </Detail>
      </Dragger>
    );
  };

  const onCancelUpload = () => {
    if (file && isParsing && !isUploadCompleted) {
      notification.info({
        message: `File upload was canceled.`,
        key: 'file-upload',
      });
    }
    setCSVModalVisible(false, isUpload);
  };

  const onOk = () => {
    if (isUploadCompleted) setCSVModalVisible(false, true);
    else onConfirmUpload();
  };

  return (
    <Modal
      visible
      title="Add new data"
      okText={okText}
      onOk={onOk}
      onCancel={onCancelUpload}
      getContainer={getContainer}
      width={UPLOAD_MODAL_WIDTH}
      okButtonProps={{
        loading: isUpload,
        disabled: !file || isUpload,
      }}
    >
      {renderModalContent()}
    </Modal>
  );
};

export default UploadCSV;
