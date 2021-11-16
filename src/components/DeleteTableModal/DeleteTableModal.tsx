import React, { MouseEvent } from 'react';

import { Body, Button, Colors, Title } from '@cognite/cogs.js';
import { notification } from 'antd';
import styled from 'styled-components';

import Modal, { ModalProps } from 'components/Modal/Modal';
import { useDeleteTable } from 'hooks/sdk-queries';
import { useCloseTable } from 'hooks/table-tabs';

type DeleteTableModalProps = {
  databaseName: string;
  tableName: string;
} & Omit<ModalProps, 'children' | 'title'>;

const StyledDeleteTableModalBody = styled(Body)`
  color: ${Colors['text-primary'].hex()};
`;

const StyledCancelButton = styled(Button)`
  margin-right: 8px;
`;

const StyledDeleteTableModalTitle = styled(Title)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 312px;
`;

const DeleteTableModal = ({
  databaseName,
  tableName,
  onCancel,
  ...modalProps
}: DeleteTableModalProps): JSX.Element => {
  const { mutate: deleteTable, isLoading } = useDeleteTable();
  const closeTable = useCloseTable();

  const handleDelete = (e: MouseEvent<HTMLButtonElement>): void => {
    deleteTable(
      { database: databaseName, table: tableName },
      {
        onSuccess: () => {
          notification.success({
            message: `Table ${tableName} deleted!`,
            key: 'table-delete',
          });
          onCancel();
          closeTable([databaseName, tableName]);
        },
        onError: (e: any) => {
          notification.error({
            message: (
              <p>
                <p>Table {tableName} was not deleted!</p>
                <pre>{JSON.stringify(e?.errors, null, 2)}</pre>
              </p>
            ),
            key: 'table-delete',
          });
        },
      }
    );
    e.stopPropagation();
  };

  return (
    <Modal
      footer={[
        <StyledCancelButton
          onClick={(e) => {
            onCancel();
            e.stopPropagation();
          }}
          type="ghost"
        >
          Cancel
        </StyledCancelButton>,
        <Button
          disabled={isLoading}
          loading={isLoading}
          onClick={handleDelete}
          type="danger"
        >
          Delete
        </Button>,
      ]}
      onCancel={onCancel}
      title={
        <StyledDeleteTableModalTitle level={5}>
          Delete {tableName}
        </StyledDeleteTableModalTitle>
      }
      {...modalProps}
    >
      <StyledDeleteTableModalBody level={2}>
        Are you sure you want to delete <b>{tableName}</b>? You will lose all of
        the data, and will not be able to restore it later.
      </StyledDeleteTableModalBody>
    </Modal>
  );
};

export default DeleteTableModal;
