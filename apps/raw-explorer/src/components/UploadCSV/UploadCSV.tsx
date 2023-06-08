import React, { useState } from 'react';

import { UploadChangeParam } from 'antd/lib/upload';
import { notification } from 'antd';
import { Button, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

import { UPLOAD_MODAL_WIDTH } from 'utils/constants';
import { getContainer, trimFileExtension } from 'utils/utils';
import { useActiveTableContext } from 'contexts';

import Modal from 'components/Modal/Modal';
import CreateTableModalUploadStep from 'components/CreateTableModal/CreateTableModalUploadStep';
import CreateTableModalPrimaryKeyStep from 'components/CreateTableModal/CreateTableModalPrimaryKeyStep';
import { PrimaryKeyMethod } from 'components/CreateTableModal/CreateTableModal';
import Dropzone from 'components/Dropzone/Dropzone';
import { useTranslation } from 'common/i18n';
import { DEFAULT_FILE_PROPS, useUpload } from 'hooks/upload';

interface UploadCsvProps {
  setCSVModalVisible(value: boolean, tableChanged?: boolean): void;
}

const UploadCSV = ({ setCSVModalVisible }: UploadCsvProps) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | undefined>();
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number>(-1);
  const [selectedPrimaryKeyMethod, setSelectedPrimaryKeyMethod] =
    useState<PrimaryKeyMethod>();

  const { database, table } = useActiveTableContext();

  const {
    uploadPercentage,
    columns,
    onConfirmUpload,
    isUploadError,
    isUploadInProgress,
    isUploadSuccess,
    uploadStatus,
  } = useUpload(file, selectedPrimaryKeyMethod, selectedColumnIndex);

  const handleCancel = () => {
    if (file && isUploadInProgress) {
      notification.info({
        message: t('file-upload-notification_cancel'),
        key: 'file-upload',
      });
    }
    setCSVModalVisible(false, uploadStatus && uploadStatus !== 'in-progress');
  };

  const onOk = () => {
    if (isUploadSuccess || isUploadError) {
      setCSVModalVisible(false, true);
    } else {
      onConfirmUpload?.(database, table);
    }
  };

  const selectPrimaryKeyMethod =
    (method: PrimaryKeyMethod): (() => void) =>
    (): void => {
      setSelectedPrimaryKeyMethod(method);
      setSelectedColumnIndex(-1);
    };

  const fileProps = {
    ...DEFAULT_FILE_PROPS,
    handleManualRemove() {
      setFile(undefined);
    },
    onChange(info: UploadChangeParam) {
      setFile(info.file.originFileObj);
    },
  };

  const okButtonProps = {
    loading: isUploadInProgress,
    disabled: !uploadStatus || uploadStatus === 'in-progress',
  };

  const okText =
    uploadStatus === 'error' || uploadStatus === 'success'
      ? t('file-upload-modal-button-ok')
      : t('file-upload-modal-button-add');

  const renderModalContent = () => {
    switch (uploadStatus) {
      case undefined:
        return <Dropzone {...fileProps} />;
      case 'ready':
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
      case 'in-progress':
      case 'error':
      case 'success':
        return (
          <CreateTableModalUploadStep
            fileName={file?.name ? trimFileExtension(file.name) : ''}
            isUploadError={isUploadError}
            isUploadSuccess={isUploadSuccess}
            onCancel={handleCancel}
            progression={uploadPercentage}
          />
        );
    }
  };

  const footer = (
    <StyledModalFooter>
      <Button type="ghost" onClick={handleCancel}>
        {t('cancel')}
      </Button>
      <Button type="primary" onClick={onOk} {...okButtonProps}>
        {okText}
      </Button>
    </StyledModalFooter>
  );

  return (
    <Modal
      visible
      title={<Title level={5}>{t('file-upload-modal-title')}</Title>}
      onOk={onOk}
      onCancel={handleCancel}
      getContainer={getContainer}
      width={UPLOAD_MODAL_WIDTH}
      footer={footer}
    >
      {renderModalContent()}
    </Modal>
  );
};

export default UploadCSV;

const StyledModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;

  & > :first-child {
    margin-right: 8px;
  }
`;
