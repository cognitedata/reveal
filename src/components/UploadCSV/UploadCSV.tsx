import React, { useState } from 'react';

import { UploadChangeParam } from 'antd/lib/upload';
import { notification, Modal, Upload } from 'antd';
import { Icon } from '@cognite/cogs.js';

import { getContainer } from 'utils/utils';
import { useCSVUpload } from 'hooks/csv-upload';

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

  const okText = isUploadCompleted ? 'OK' : 'Confirm Upload';

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
        <p className="ant-upload-drag-icon">
          <Icon size={24} type="Upload" />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          The first row in the CSV file must contain all{' '}
          <strong>table column names</strong>. <br />
          Each column with data must have a corresponding column title.
        </p>
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
      title="Upload CSV file"
      okText={okText}
      onOk={onOk}
      onCancel={onCancelUpload}
      getContainer={getContainer}
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
