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

const mockColumns = [
  'key',
  'covariance_xy',
  'data_entry_mode',
  'covariance_yz',
  'y_offset',
  'sequence_no',
  'inclination',
  'definitive_survey_id',
  'covariance_zz',
  'tvd',
  'covariance_xx',
  'x_offset',
  'azimuth',
  'ellipse_vertical',
  'md',
];

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
  const [selectedColumn, setSelectedColumn] = useState<string>();

  const { mutate: createDatabase, isLoading: isCreatingTable } =
    useCreateTable();
  const [, openTable] = useActiveTable();

  const isUnique = !tables.some(({ name }) => name === tableName);
  const isCreationDisabled =
    tableName.length === 0 ||
    tableName.length > 64 ||
    !selectedCreationMode ||
    !isUnique ||
    isCreatingTable;

  const isUploadDisabled =
    !selectedPrimaryKeyMethod ||
    (selectedPrimaryKeyMethod === PrimaryKeyMethod.ChooseColumn &&
      !selectedColumn);

  useEffect(() => {
    if (!visible) {
      setTableName('');
      setCreateTableModalStep(CreateTableModalStep.CreationMode);
      setSelectedCreationMode(undefined);
      setSelectedPrimaryKeyMethod(undefined);
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

  const renderCreateTableModalStep = (): JSX.Element | undefined => {
    if (createTableModalStep === CreateTableModalStep.CreationMode) {
      return (
        <CreateTableModalCreationModeStep
          isCreatingTable={isCreatingTable}
          selectedCreationMode={selectedCreationMode}
          selectCreationMode={selectCreationMode}
        />
      );
    }
    if (createTableModalStep === CreateTableModalStep.PrimaryKey) {
      return (
        <CreateTableModalPrimaryKeyStep
          columns={mockColumns}
          selectedColumn={selectedColumn}
          selectColumnAsPrimaryKey={(name: string) => setSelectedColumn(name)}
          selectedPrimaryKeyMethod={selectedPrimaryKeyMethod}
          selectPrimaryKeyMethod={selectPrimaryKeyMethod}
        />
      );
    }
  };

  return (
    <Modal
      footer={[
        <StyledCancelButton onClick={onCancel} type="ghost">
          Cancel
        </StyledCancelButton>,
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
        ...(selectedCreationMode === CreationMode.Upload
          ? [
              <Button disabled={isUploadDisabled} type="primary">
                Upload
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
