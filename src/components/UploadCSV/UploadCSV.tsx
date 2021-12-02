import React, { useState } from 'react';

import { UploadChangeParam } from 'antd/lib/upload';
import { notification } from 'antd';
import { Button, Colors, Detail, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

import { UPLOAD_MODAL_WIDTH } from 'utils/constants';
import { getContainer, trimFileExtension } from 'utils/utils';
import { useCSVUpload } from 'hooks/csv-upload';
import { useActiveTableContext } from 'contexts';

import { CustomIcon } from 'components/CustomIcon';
import Dragger from 'components/Dragger';
import Modal from 'components/Modal/Modal';
import CreateTableModalUploadStep from 'components/CreateTableModal/CreateTableModalUploadStep';
import CreateTableModalPrimaryKeyStep from 'components/CreateTableModal/CreateTableModalPrimaryKeyStep';
import { PrimaryKeyMethod } from 'components/CreateTableModal/CreateTableModal';

interface UploadCsvProps {
  setCSVModalVisible(value: boolean, tableChanged?: boolean): void;
}

const UploadCSV = ({ setCSVModalVisible }: UploadCsvProps) => {
  const [file, setFile] = useState<File | undefined>();
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number>(-1);
  const [selectedPrimaryKeyMethod, setSelectedPrimaryKeyMethod] =
    useState<PrimaryKeyMethod>();

  const { database, table } = useActiveTableContext();
  const {
    uploadPercentage,
    columns,
    isUpload,
    isUploadCompleted,
    isUploadFailed,
    isParsing,
    onConfirmUpload,
  } = useCSVUpload(file, selectedColumnIndex);

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

  const selectPrimaryKeyMethod =
    (method: PrimaryKeyMethod): (() => void) =>
    (): void => {
      setSelectedPrimaryKeyMethod(method);
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
  const isStepAddFile = !file;
  const isStepChooseColumn = file && !(isUpload || isUploadCompleted);
  const isStepUpload = file && (isUpload || isUploadCompleted);

  const renderModalContent = () => {
    if (isStepAddFile)
      return (
        <Dragger {...fileProps}>
          <CustomIcon icon="DocumentIconDisabled" />
          <StyledModalTitle level={6}>Add CSV file</StyledModalTitle>
          <StyledModalDetail strong>
            Drag and drop, or click to select.
          </StyledModalDetail>
        </Dragger>
      );
    if (isStepUpload)
      return (
        <CreateTableModalUploadStep
          fileName={file?.name ? trimFileExtension(file.name) : ''}
          isUploadFailed={isUploadFailed}
          isUploadCompleted={isUploadCompleted}
          onCancel={onCancelUpload}
          progression={uploadPercentage}
        />
      );
    if (isStepChooseColumn)
      return (
        <CreateTableModalPrimaryKeyStep
          columns={columns}
          selectedPrimaryKeyMethod={selectedPrimaryKeyMethod}
          selectPrimaryKeyMethod={selectPrimaryKeyMethod}
          selectedColumnIndex={selectedColumnIndex}
          selectColumnAsPrimaryKey={(index: number) =>
            setSelectedColumnIndex(index)
          }
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
