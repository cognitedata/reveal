import React, { useState } from 'react';

import { Button, Colors, Detail, Input, Title } from '@cognite/cogs.js';
import { RawDBTable } from '@cognite/sdk';
import { notification } from 'antd';
import { useFormik } from 'formik';
import styled from 'styled-components';

import { Trans, useTranslation } from 'common/i18n';
import { useUpload } from 'hooks/upload';
import { useCreateTable } from 'hooks/sdk-queries';
import { useActiveTable } from 'hooks/table-tabs';
import { trimFileExtension } from 'utils/utils';
import { CREATE_TABLE_MODAL_WIDTH } from 'utils/constants';

import FormFieldWrapper from 'components/FormFieldWrapper/FormFieldWrapper';
import Modal, { ModalProps } from 'components/Modal/Modal';
import CreateTableModalCreationModeStep from './CreateTableModalCreationModeStep';
import CreateTableModalPrimaryKeyStep from './CreateTableModalPrimaryKeyStep';
import CreateTableModalUploadStep from './CreateTableModalUploadStep';

export enum CreateTableModalStep {
  CreationMode = 'creationMode',
  PrimaryKey = 'primaryKey',
  Upload = 'upload',
}

export enum CreationMode {
  Empty = 'empty',
  Upload = 'upload',
}

export enum PrimaryKeyMethod {
  ChooseColumn = 'chooseColumn',
  AutoGenerate = 'autoGenerate',
}

type CreateTableFormValues = {
  tableName: string;
};

type CreateTableModalProps = {
  databaseName: string;
  tables: RawDBTable[];
} & Omit<ModalProps, 'children' | 'onOk' | 'title' | 'width'>;

const CreateTableModal = ({
  databaseName,
  onCancel,
  tables,
  visible,
  ...modalProps
}: CreateTableModalProps): JSX.Element => {
  const { t } = useTranslation();
  const [createTableModalStep, setCreateTableModalStep] = useState(
    CreateTableModalStep.CreationMode
  );
  const [selectedCreationMode, setSelectedCreationMode] =
    useState<CreationMode>();
  const [selectedPrimaryKeyMethod, setSelectedPrimaryKeyMethod] =
    useState<PrimaryKeyMethod>();
  const [file, setFile] = useState<File>(); // eslint-disable-line
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number>(-1);

  const {
    mutate: createDatabase,
    isLoading: isCreatingTable,
    isSuccess: tableCreated,
  } = useCreateTable();
  const [_, openTable] = useActiveTable();

  const {
    columns,
    onConfirmUpload,
    uploadPercentage,
    isUploadError,
    isUploadInProgress,
    isUploadSuccess,
    uploadStatus,
  } = useUpload(file, selectedPrimaryKeyMethod, selectedColumnIndex);

  const { errors, handleBlur, handleChange, handleSubmit, values, resetForm } =
    useFormik<CreateTableFormValues>({
      initialValues: {
        tableName: '',
      },
      onSubmit: handleCreate,
      validate: handleValidation,
      validateOnBlur: false,
    });

  const isCreationDisabled =
    !values.tableName ||
    !!errors.tableName ||
    !selectedCreationMode ||
    isCreatingTable;

  const isUploadDisabled =
    isCreationDisabled ||
    !selectedPrimaryKeyMethod ||
    (selectedPrimaryKeyMethod === PrimaryKeyMethod.ChooseColumn &&
      !(selectedColumnIndex >= 0));

  function handleCancel(): void {
    if (file && isUploadInProgress) {
      notification.info({
        message: t('create-table-modal-file-upload-notification_cancel'),
        key: 'file-upload',
      });
    }
    if (tableCreated) {
      openTable([databaseName, values.tableName]);
    }
    resetForm();
    setCreateTableModalStep(CreateTableModalStep.CreationMode);
    onCancel();
  }

  function handleCreate(): void {
    createDatabase(
      { database: databaseName, table: values.tableName },
      {
        onSuccess: () => {
          if (selectedCreationMode === CreationMode.Upload) {
            setCreateTableModalStep(CreateTableModalStep.Upload);
            onConfirmUpload?.(databaseName, values.tableName);
          } else {
            notification.success({
              message: t('table-created-notification_success', {
                name: values.tableName,
              }),
              key: 'create-table',
            });
            handleCancel();
            openTable([databaseName, values.tableName]);
            resetForm();
          }
        },
        onError: (e) => {
          notification.error({
            message: t('table-created-notification_error', {
              name: values.tableName,
            }),
            description:
              e.status === 403 ? (
                <div>
                  <Trans i18nKey="explorer-side-panel-tables-access-warning" />
                </div>
              ) : (
                <div>
                  <pre>{JSON.stringify(e, null, 2)}</pre>
                </div>
              ),
            key: 'create-table',
          });
        },
      }
    );
  }

  function handleValidation(values: CreateTableFormValues) {
    const errors: Partial<Record<keyof CreateTableFormValues, string>> = {};
    if (!values.tableName) {
      errors.tableName = t('table-name-validation-error-required');
    } else if (values.tableName.length > 64) {
      errors.tableName = t('table-name-validation-error-long');
    } else if (tables.some(({ name }) => name === values.tableName)) {
      errors.tableName = t('table-name-validation-error-duplicate');
    }
    return errors;
  }

  function selectCreationMode(mode: CreationMode): () => void {
    return (): void => {
      setSelectedCreationMode(mode);
      if (mode === CreationMode.Upload) {
        setCreateTableModalStep(CreateTableModalStep.PrimaryKey);
      }
    };
  }

  function selectPrimaryKeyMethod(method: PrimaryKeyMethod): () => void {
    return (): void => {
      setSelectedPrimaryKeyMethod(method);
      setSelectedColumnIndex(-1);
    };
  }

  function selectFile(file?: File): void {
    setFile(file);
    if (values.tableName.length === 0 && file) {
      handleChange('tableName')(trimFileExtension(file.name));
    }
  }

  function renderCreateTableModalStep(): JSX.Element | undefined {
    switch (uploadStatus) {
      case undefined:
        return (
          <CreateTableModalCreationModeStep
            isCreatingTable={isCreatingTable}
            selectedCreationMode={selectedCreationMode}
            selectCreationMode={selectCreationMode}
            setFile={selectFile}
          />
        );
      case 'ready':
        return (
          <CreateTableModalPrimaryKeyStep
            columns={columns}
            selectedColumnIndex={selectedColumnIndex}
            selectColumnAsPrimaryKey={(index: number) =>
              setSelectedColumnIndex(index)
            }
            selectedPrimaryKeyMethod={selectedPrimaryKeyMethod}
            selectPrimaryKeyMethod={selectPrimaryKeyMethod}
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
  }

  return (
    <form onSubmit={handleSubmit}>
      <Modal
        footer={
          <>
            {createTableModalStep !== CreateTableModalStep.Upload ? (
              <StyledCancelButton onClick={handleCancel} type="ghost">
                {t('cancel')}
              </StyledCancelButton>
            ) : (
              (isUploadSuccess || isUploadError) && (
                <Button onClick={handleCancel} type="primary">
                  {t('create-table-modal-button-ok')}
                </Button>
              )
            )}
            {selectedCreationMode === CreationMode.Empty && (
              <Button
                disabled={isCreationDisabled}
                loading={isCreatingTable}
                onClick={() => handleSubmit()}
                type="primary"
              >
                {t('create-table-modal-button-create')}
              </Button>
            )}
            {createTableModalStep === CreateTableModalStep.PrimaryKey && (
              <Button
                disabled={isUploadDisabled}
                loading={isCreatingTable}
                onClick={() => handleSubmit()}
                type="primary"
              >
                {t('create-database-modal-button-create')}
              </Button>
            )}
          </>
        }
        maskClosable={createTableModalStep !== CreateTableModalStep.Upload}
        onCancel={handleCancel}
        title={t('create-table-modal-title')}
        visible={visible}
        {...modalProps}
        width={CREATE_TABLE_MODAL_WIDTH}
      >
        {createTableModalStep !== CreateTableModalStep.Upload && (
          <FormFieldWrapper
            isRequired
            title={t('create-table-modal-name-field-title')}
          >
            <Input
              autoFocus
              disabled={isCreatingTable}
              error={errors.tableName}
              fullWidth
              onBlur={handleBlur}
              onChange={handleChange('tableName')}
              onKeyUp={(e) => {
                if (!isCreationDisabled && e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              placeholder={t('create-table-modal-name-field-placeholder')}
              value={values.tableName}
            />
            {!errors.tableName && (
              <StyledNameInputDetail>
                {t('create-table-modal-name-field-note')}
              </StyledNameInputDetail>
            )}
          </FormFieldWrapper>
        )}
        {renderCreateTableModalStep()}
      </Modal>
    </form>
  );
};

const StyledNameInputDetail = styled(Detail)`
  color: ${Colors['text-icon--medium']};
  font-size: 13px;
  margin-bottom: 16px;
`;

const StyledCancelButton = styled(Button)`
  margin-right: 8px;
`;

export default CreateTableModal;
