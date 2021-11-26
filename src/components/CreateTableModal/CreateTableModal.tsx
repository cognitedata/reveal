import React, { ChangeEvent, useEffect, useState } from 'react';

import { Button, Colors, Detail, Input, Title } from '@cognite/cogs.js';
import { RawDBTable } from '@cognite/sdk';
import { notification } from 'antd';
import styled from 'styled-components';

import FormFieldWrapper from 'components/FormFieldWrapper/FormFieldWrapper';
import Modal, { ModalProps } from 'components/Modal/Modal';
import { useCreateTable } from 'hooks/sdk-queries';
import { useActiveTable } from 'hooks/table-tabs';

import CreateTableModalCreationModeStep from './CreateTableModalCreationModeStep';
import CreateTableModalPrimaryKeyStep from './CreateTableModalPrimaryKeyStep';
import CreateTableModalUploadStep from './CreateTableModalUploadStep';
import { useCSVUpload } from 'hooks/csv-upload';
import { trimFileExtension } from 'utils/utils';

const CREATE_TABLE_MODAL_WIDTH = 600;

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
  const [tableName, setTableName] = useState('');
  const [createTableModalStep, setCreateTableModalStep] = useState(
    CreateTableModalStep.CreationMode
  );
  const [selectedCreationMode, setSelectedCreationMode] =
    useState<CreationMode>();
  const [selectedPrimaryKeyMethod, setSelectedPrimaryKeyMethod] =
    useState<PrimaryKeyMethod>();
  const [file, setFile] = useState<File>(); // eslint-disable-line
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number>(-1);

  const { mutate: createDatabase, isLoading: isCreatingTable } =
    useCreateTable();
  const [, openTable] = useActiveTable();

  const {
    columns,
    isUploadFailed,
    isUploadCompleted,
    onConfirmUpload,
    uploadPercentage,
  } = useCSVUpload(file, selectedColumnIndex);

  const isUnique = !tables.some(({ name }) => name === tableName);
  const isCreationDisabled =
    tableName.length === 0 ||
    tableName.length > 64 ||
    !selectedCreationMode ||
    !isUnique ||
    isCreatingTable;

  const isUploadDisabled =
    isCreationDisabled ||
    !selectedPrimaryKeyMethod ||
    (selectedPrimaryKeyMethod === PrimaryKeyMethod.ChooseColumn &&
      !(selectedColumnIndex >= 0));

  useEffect(() => {
    if (!visible) {
      setTableName('');
      setCreateTableModalStep(CreateTableModalStep.CreationMode);
      setSelectedCreationMode(undefined);
      setSelectedPrimaryKeyMethod(undefined);
      setFile(undefined);
      setSelectedColumnIndex(-1);
    }
  }, [visible]);

  const handleCreate = (): void => {
    createDatabase(
      { database: databaseName, table: tableName },
      {
        onSuccess: () => {
          notification.success({
            message: `Table ${tableName} created!`,
            key: 'create-table',
          });
          onCancel();
          openTable([databaseName, tableName]);
        },
        onError: (e: any) => {
          notification.error({
            message: (
              <p>
                <p>Table {tableName} was not created!</p>
                <pre>{JSON.stringify(e?.errors, null, 2)}</pre>
              </p>
            ),
            key: 'create-table',
          });
        },
      }
    );
  };

  const handleUpload = (): void => {
    createDatabase(
      { database: databaseName, table: tableName },
      {
        onSuccess: () => {
          setCreateTableModalStep(CreateTableModalStep.Upload);
          onConfirmUpload(databaseName, tableName);
        },
        onError: (e: any) => {
          notification.error({
            message: (
              <p>
                <p>Table {tableName} was not created!</p>
                <pre>{JSON.stringify(e?.errors, null, 2)}</pre>
              </p>
            ),
            key: 'create-table',
          });
        },
      }
    );
  };

  const selectCreationMode =
    (mode: CreationMode): (() => void) =>
    (): void => {
      setSelectedCreationMode(mode);
      if (mode === CreationMode.Upload) {
        setCreateTableModalStep(CreateTableModalStep.PrimaryKey);
      }
    };

  const selectPrimaryKeyMethod =
    (method: PrimaryKeyMethod): (() => void) =>
    (): void => {
      setSelectedPrimaryKeyMethod(method);
    };

  const selectFile = (file?: File): void => {
    setFile(file);
    if (tableName.length === 0 && file) {
      setTableName(trimFileExtension(file.name));
    }
  };

  const renderCreateTableModalStep = (): JSX.Element | undefined => {
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
          progression={uploadPercentage}
        />
      );
    }
  };

  return (
    <Modal
      footer={[
        ...(createTableModalStep !== CreateTableModalStep.Upload
          ? [
              <StyledCancelButton onClick={onCancel} type="ghost">
                Cancel
              </StyledCancelButton>,
            ]
          : []),
        ...(selectedCreationMode === CreationMode.Empty
          ? [
              <Button
                disabled={isCreationDisabled}
                loading={isCreatingTable}
                onClick={handleCreate}
                type="primary"
              >
                Create
              </Button>,
            ]
          : []),
        ...(createTableModalStep === CreateTableModalStep.PrimaryKey
          ? [
              <Button
                disabled={isUploadDisabled}
                onClick={handleUpload}
                type="primary"
              >
                Create
              </Button>,
            ]
          : []),
        ...(isUploadCompleted
          ? [
              <Button onClick={onCancel} type="primary">
                OK
              </Button>,
            ]
          : []),
      ]}
      onCancel={onCancel}
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
            fullWidth
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setTableName(e.target.value)
            }
            onKeyUp={(e) => {
              if (!isCreationDisabled && e.key === 'Enter') {
                handleCreate();
              }
            }}
            placeholder="Enter name"
            value={tableName}
          />
          <StyledNameInputDetail>
            The name should be unique. You can not change this name later.
          </StyledNameInputDetail>
        </FormFieldWrapper>
      )}
      {renderCreateTableModalStep()}
    </Modal>
  );
};

const StyledNameInputDetail = styled(Detail)`
  color: ${Colors['text-secondary'].hex()};
  margin-bottom: 16px;
`;

const StyledCancelButton = styled(Button)`
  margin-right: 8px;
`;

export default CreateTableModal;
