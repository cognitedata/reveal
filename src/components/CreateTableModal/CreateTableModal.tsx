import React, { ChangeEvent, useEffect, useState } from 'react';

import {
  Body,
  Button,
  Colors,
  Detail,
  Icon,
  Input,
  Title,
} from '@cognite/cogs.js';
import { RawDBTable } from '@cognite/sdk';
import { notification } from 'antd';
import styled from 'styled-components';

import Modal, { ModalProps } from 'components/Modal/Modal';
import { useCreateTable } from 'hooks/sdk-queries';
import { useOpenTable } from 'hooks/table-tabs';
import FormFieldWrapper from 'components/FormFieldWrapper/FormFieldWrapper';

const CREATE_TABLE_MODAL_WIDTH = 600;

enum CreateTableOption {
  Empty = 'empty',
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
  const [selectedCreateTableOption, setSelectedCreateTableOption] =
    useState<CreateTableOption>();

  const { mutate: createDatabase, isLoading } = useCreateTable();
  const openTable = useOpenTable();

  const isUnique = !tables.some(({ name }) => name === tableName);
  const isDisabled =
    tableName.length === 0 ||
    tableName.length > 64 ||
    !selectedCreateTableOption ||
    !isUnique ||
    isLoading;

  useEffect(() => {
    if (!visible) {
      setTableName('');
      setSelectedCreateTableOption(undefined);
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

  const selectOption =
    (option: CreateTableOption): (() => void) =>
    (): void => {
      setSelectedCreateTableOption(option);
    };

  return (
    <Modal
      footer={[
        <StyledCancelButton onClick={onCancel} type="ghost">
          Cancel
        </StyledCancelButton>,
        <Button
          disabled={isDisabled}
          loading={isLoading}
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
          disabled={isLoading}
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
      <FormFieldWrapper isRequired title="Select one">
        <StyledCreateOptions>
          <StyledCreateOption>left</StyledCreateOption>
          <StyledCreateOption onClick={selectOption(CreateTableOption.Empty)}>
            <StyledCreateEmptyTableWrapper
              $isSelected={
                selectedCreateTableOption === CreateTableOption.Empty
              }
            >
              <StyledCreateEmptyTableIcon size={32} type="DataTable" />
              <StyledCreateEmptyTableTitle level={6} strong>
                Create an empty table
              </StyledCreateEmptyTableTitle>
              <StyledCreateEmptyTableDetail strong>
                Upload files later or write data directly using the API.
              </StyledCreateEmptyTableDetail>
            </StyledCreateEmptyTableWrapper>
          </StyledCreateOption>
        </StyledCreateOptions>
      </FormFieldWrapper>
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

const StyledCreateOptions = styled.ul`
  display: flex;
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const StyledCreateOption = styled.li`
  flex: 1;

  :not(:last-child) {
    margin-right: 16px;
  }
`;

const StyledCreateEmptyTableIcon = styled(Icon)`
  color: ${Colors['border-default']};
`;

const StyledCreateEmptyTableWrapper = styled.div<{ $isSelected?: boolean }>`
  align-items: center;
  border: 1px solid ${Colors['border-default'].hex()};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  padding: 36px;

  &:hover {
    background-color: ${Colors['bg-hover'].hex()};
    border-color: ${Colors['bg-status-small--accent'].hex()};

    ${StyledCreateEmptyTableIcon} {
      color: ${Colors['bg-status-small--accent'].hex()};
    }
  }

  &:active {
    background-color: ${Colors['bg-selected'].hex()};
    border: 2px solid ${Colors['bg-status-small--accent-hover'].hex()};
    padding: 35px;

    ${StyledCreateEmptyTableIcon} {
      color: ${Colors['bg-status-small--accent-hover'].hex()};
    }
  }

  ${({ $isSelected }) =>
    $isSelected
      ? `
      background-color: ${Colors['bg-selected'].hex()};
      border: 2px solid ${Colors['bg-status-small--accent-hover'].hex()};
      padding: 35px;
  
      ${StyledCreateEmptyTableIcon} {
        color: ${Colors['bg-status-small--accent-hover'].hex()};
      }`
      : ''};
`;

const StyledCreateEmptyTableTitle = styled(Body)`
  color: ${Colors['text-primary']};
  margin: 16px 0 8px;
`;

const StyledCreateEmptyTableDetail = styled(Detail)`
  color: ${Colors['text-hint']};
  text-align: center;
`;

export default CreateTableModal;
