import React, { useState } from 'react';

import { Body, Button, Checkbox, Colors, Title } from '@cognite/cogs.js';
import { notification } from 'antd';
import styled from 'styled-components';

import Modal, { ModalProps } from 'components/Modal/Modal';
import { useDeleteTable } from 'hooks/sdk-queries';
import { useCloseTable } from 'hooks/table-tabs';

type DeleteTableModalProps = {
  databaseName: string;
  tableName: string;
} & Omit<ModalProps, 'children' | 'title'>;

const DeleteTableModal = ({
  databaseName,
  tableName,
  onCancel,
  ...modalProps
}: DeleteTableModalProps): JSX.Element => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const { mutate: deleteTable, isLoading } = useDeleteTable();
  const closeTable = useCloseTable();

  const handleDelete = (): void => {
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
  };

  const handleClose = (): void => {
    setIsConfirmed(false);
    onCancel();
  };

  const handleConfirmCheckboxChange = (isChecked: boolean): void => {
    setIsConfirmed(isChecked);
  };

  return (
    <span onClick={(e) => e.stopPropagation()}>
      <Modal
        footer={[
          <StyledCancelButton onClick={handleClose} type="ghost">
            Cancel
          </StyledCancelButton>,
          <Button
            disabled={isLoading || !isConfirmed}
            loading={isLoading}
            onClick={handleDelete}
            type="danger"
          >
            Delete
          </Button>,
        ]}
        onCancel={handleClose}
        title={
          <StyledDeleteTableModalTitle level={5}>
            Delete {tableName}
          </StyledDeleteTableModalTitle>
        }
        {...modalProps}
      >
        <StyledDeleteTableModalBody level={2}>
          Are you sure you want to delete <b>{tableName}</b>? You will lose all
          of the data, and <b>will not</b> be able to restore it later.
        </StyledDeleteTableModalBody>
        <StyledConfirmCheckboxWrapper>
          <StyledConfirmCheckbox
            checked={isConfirmed}
            name="confirm-delete-table"
            onChange={handleConfirmCheckboxChange}
          >
            Yes, I'm sure I want to delete this table
          </StyledConfirmCheckbox>
        </StyledConfirmCheckboxWrapper>
      </Modal>
    </span>
  );
};

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

const StyledConfirmCheckboxWrapper = styled.div`
  display: flex;
  margin-top: 16px;
`;

const StyledConfirmCheckbox = styled(Checkbox)`
  margin-right: 8px;
`;

export default DeleteTableModal;
