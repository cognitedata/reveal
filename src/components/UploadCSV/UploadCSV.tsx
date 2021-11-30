import React, { useState } from 'react';

import { UploadChangeParam } from 'antd/lib/upload';
import { notification } from 'antd';
import { Button, Colors, Detail, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

import { UPLOAD_MODAL_WIDTH } from 'utils/constants';
import { getContainer } from 'utils/utils';
import { useCSVUpload } from 'hooks/csv-upload';
import { useActiveTableContext } from 'contexts';

import { CustomIcon } from 'components/CustomIcon';
import Dragger from 'components/Dragger';
import Modal from 'components/Modal/Modal';
import { ModalProgress } from './ModalProgress';
import { ModalChooseKey } from './ModalChooseKey';

interface UploadCsvProps {
  setCSVModalVisible(value: boolean, tableChanged?: boolean): void;
}

const UploadCSV = ({ setCSVModalVisible }: UploadCsvProps) => {
  const [file, setFile] = useState<File | undefined>();
  const [selectedKeyIndex, setSelectedKeyIndex] = useState<number>(-1);

  const { database, table } = useActiveTableContext();
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
    else onConfirmUpload(database, table);
  };

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

  const okButtonProps = {
    loading: isUpload,
    disabled: !file || isUpload,
  };

  const okText = isUploadCompleted ? 'OK' : 'Add';

  const renderModalContent = () => {
    if (!file)
      return (
        <Dragger {...fileProps}>
          <CustomIcon icon="DocumentIcon" />
          <StyledModalTitle level={6}>Add CSV file</StyledModalTitle>
          <StyledModalDetail strong>
            Drag and drop, or click to select.
          </StyledModalDetail>
        </Dragger>
      );
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
  };

  const footer = (
    <StyledModalFooter>
      <Button variant="ghost" onClick={onCancelUpload}>
        Cancel
      </Button>
      <Button type="primary" onClick={onOk} {...okButtonProps}>
        {okText}
      </Button>
    </StyledModalFooter>
  );

  return (
    <Modal
      visible
      title={<Title level={5}>Add new data</Title>}
      onOk={onOk}
      onCancel={onCancelUpload}
      getContainer={getContainer}
      width={UPLOAD_MODAL_WIDTH}
      footer={footer}
    >
      {renderModalContent()}
    </Modal>
  );
};

export default UploadCSV;

const StyledModalTitle = styled(Title)`
  margin: 16px 0 8px 0;
`;
const StyledModalDetail = styled(Detail)`
  color: ${Colors['greyscale-grey6'].hex()};
`;
const StyledModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;

  & > :first-child {
    margin-right: 8px;
  }
`;
