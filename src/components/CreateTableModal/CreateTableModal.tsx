import React, { useRef, useState } from 'react';

import { Button, Colors, Detail, Input, Title } from '@cognite/cogs.js';
import { RawDBTable } from '@cognite/sdk';
import { notification } from 'antd';
import { useFormik } from 'formik';
import styled from 'styled-components';

import { useCreateTable } from 'hooks/sdk-queries';
import { useActiveTable } from 'hooks/table-tabs';
import { useCSVUpload } from 'hooks/csv-upload';
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
  const [createTableModalStep, setCreateTableModalStep] = useState(
    CreateTableModalStep.CreationMode
  );
  const [selectedCreationMode, setSelectedCreationMode] =
    useState<CreationMode>();
  const [selectedPrimaryKeyMethod, setSelectedPrimaryKeyMethod] =
    useState<PrimaryKeyMethod>();
  const [file, setFile] = useState<File>(); // eslint-disable-line
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number>(-1);
  const remountCount = useRef(0);

  const {
    mutate: createDatabase,
    isLoading: isCreatingTable,
    isSuccess: tableCreated,
  } = useCreateTable();
  const [_, openTable] = useActiveTable();

  const {
    columns,
    isParsing,
    isUploadFailed,
    isUploadCompleted,
    onConfirmUpload,
    uploadPercentage,
  } = useCSVUpload(file, selectedPrimaryKeyMethod, selectedColumnIndex);

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
    if (file && isParsing && !isUploadCompleted) {
      notification.info({
        message: `File upload was canceled.`,
        key: 'file-upload',
      });
    }
    if (tableCreated) {
      openTable([databaseName, values.tableName]);
    }
    resetForm();
    setCreateTableModalStep(CreateTableModalStep.CreationMode);
    onCancel();
    // We tie this to a key property on the wrapping <form>...</form> element
    // in order to remount the whole component whenever we close/cancel the modal
    // so the whole state gets reset.
    remountCount.current += 1;
  }

  function handleCreate(): void {
    createDatabase(
      { database: databaseName, table: values.tableName },
      {
        onSuccess: () => {
          if (selectedCreationMode === CreationMode.Upload) {
            setCreateTableModalStep(CreateTableModalStep.Upload);
            onConfirmUpload(databaseName, values.tableName);
          } else {
            notification.success({
              message: `Table ${values.tableName} created!`,
              key: 'create-table',
            });
            handleCancel();
            openTable([databaseName, values.tableName]);
            resetForm();
          }
        },
        onError: (e: any) => {
          notification.error({
            message: (
              <p>
                <p>Table {values.tableName} was not created!</p>
                <pre>{JSON.stringify(e?.errors, null, 2)}</pre>
              </p>
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
      errors.tableName = 'A required field is missing.';
    } else if (values.tableName.length > 64) {
      errors.tableName = 'This name exceeds the character limit (64).';
    } else if (tables.some(({ name }) => name === values.tableName)) {
      errors.tableName = 'This name already exist. Try a different name.';
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
    if (createTableModalStep === CreateTableModalStep.CreationMode) {
      return (
        <CreateTableModalCreationModeStep
          isCreatingTable={isCreatingTable}
          selectedCreationMode={selectedCreationMode}
          selectCreationMode={selectCreationMode}
          setFile={selectFile}
        />
      );
    }
    if (createTableModalStep === CreateTableModalStep.PrimaryKey) {
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
    }
    if (createTableModalStep === CreateTableModalStep.Upload) {
      return (
        <CreateTableModalUploadStep
          fileName={file?.name ? trimFileExtension(file.name) : ''}
          isUploadFailed={isUploadFailed}
          isUploadCompleted={isUploadCompleted}
          onCancel={handleCancel}
          progression={uploadPercentage}
        />
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} key={remountCount.current}>
      <Modal
        footer={
          <>
            {createTableModalStep !== CreateTableModalStep.Upload && (
              <StyledCancelButton onClick={handleCancel} type="ghost">
                Cancel
              </StyledCancelButton>
            )}
            {selectedCreationMode === CreationMode.Empty && (
              <Button
                disabled={isCreationDisabled}
                loading={isCreatingTable}
                onClick={() => handleSubmit()}
                type="primary"
              >
                Create
              </Button>
            )}
            {createTableModalStep === CreateTableModalStep.PrimaryKey && (
              <Button
                disabled={isUploadDisabled}
                loading={isCreatingTable}
                onClick={() => handleSubmit()}
                type="primary"
              >
                Create
              </Button>
            )}
            {selectedCreationMode === CreationMode.Upload &&
              (isUploadCompleted || isUploadFailed) && (
                <Button onClick={handleCancel} type="primary">
                  OK
                </Button>
              )}
          </>
        }
        maskClosable={createTableModalStep !== CreateTableModalStep.Upload}
        onCancel={handleCancel}
        title={<Title level={5}>Create table</Title>}
        visible={visible}
        {...modalProps}
        width={CREATE_TABLE_MODAL_WIDTH}
      >
        {createTableModalStep !== CreateTableModalStep.Upload && (
          <FormFieldWrapper isRequired title="Name">
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
              placeholder="Enter name"
              value={values.tableName}
            />
            {!errors.tableName && (
              <StyledNameInputDetail>
                The name should be unique. You can not change this name later.
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
  color: ${Colors['text-secondary'].hex()};
  font-size: 13px;
  margin-bottom: 16px;
`;

const StyledCancelButton = styled(Button)`
  margin-right: 8px;
`;

export default CreateTableModal;
