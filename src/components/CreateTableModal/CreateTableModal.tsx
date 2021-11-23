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

const CREATE_TABLE_MODAL_WIDTH = 600;

export enum CreationMode {
  Empty = 'empty',
  Upload = 'upload',
}

export enum CreateTableModalStep {
  CreationMode = 'creationMode',
  PrimaryKey = 'primaryKey',
  Upload = 'upload',
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
  const [selectedCreationMode, setSelectedCreationMode] =
    useState<CreationMode>();

  const { mutate: createDatabase, isLoading: isCreatingTable } =
    useCreateTable();
  const [, openTable] = useActiveTable();

  const isUnique = !tables.some(({ name }) => name === tableName);
  const isDisabled =
    tableName.length === 0 ||
    tableName.length > 64 ||
    !selectedCreationMode ||
    !isUnique ||
    isCreatingTable;

  useEffect(() => {
    if (!visible) {
      setTableName('');
      setSelectedCreationMode(undefined);
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
    (option: CreationMode): (() => void) =>
    (): void => {
      setSelectedCreationMode(option);
    };

  const renderCreateTableModalStep = (): JSX.Element | undefined => {
    if (CreateTableModalStep.CreationMode) {
      return (
        <CreateTableModalCreationModeStep
          isCreatingTable={isCreatingTable}
          selectedCreationMode={selectedCreationMode}
          selectCreationMode={selectCreationMode}
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
        <Button
          disabled={isDisabled}
          loading={isCreatingTable}
          onClick={handleCreate}
          type="primary"
        >
          Create
        </Button>,
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
            if (!isDisabled && e.key === 'Enter') {
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
