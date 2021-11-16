import React, { useContext } from 'react';

import { Body, Button, Colors, Title } from '@cognite/cogs.js';
import { notification } from 'antd';
import styled from 'styled-components';

import Modal, { ModalProps } from 'components/Modal/Modal';
import { RawExplorerContext } from 'contexts';
import { useDeleteDatabase } from 'hooks/sdk-queries';
import { useCloseDatabase } from 'hooks/table-tabs';

type DeleteDatabaseModalProps = {
  databaseName: string;
} & Omit<ModalProps, 'children' | 'onOk' | 'title'>;

const StyledDeleteDatabaseModalBody = styled(Body)`
  color: ${Colors['text-primary'].hex()};
`;

const StyledCancelButton = styled(Button)`
  margin-right: 8px;
`;

const StyledDeleteDatabaseModalTitle = styled(Title)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 312px;
`;

const DeleteDatabaseModal = ({
  databaseName,
  onCancel,
  ...modalProps
}: DeleteDatabaseModalProps): JSX.Element => {
  const { setSelectedSidePanelDatabase } = useContext(RawExplorerContext);

  const { mutate: deleteDatabase, isLoading } = useDeleteDatabase();
  const closeDatabase = useCloseDatabase();

  const handleDelete = (): void => {
    deleteDatabase(
      { database: databaseName },
      {
        onSuccess: () => {
          notification.success({
            message: `Database ${databaseName} deleted!`,
            key: 'database-delete',
          });
          onCancel();
          setSelectedSidePanelDatabase(undefined);
          closeDatabase([databaseName]);
        },
        onError: (e: any) => {
          notification.error({
            message: (
              <p>
                <p>Database {databaseName} was not deleted!</p>
                <pre>{JSON.stringify(e?.errors, null, 2)}</pre>
              </p>
            ),
            key: 'database-delete',
          });
        },
      }
    );
  };

  return (
    <Modal
      footer={[
        <StyledCancelButton onClick={onCancel} type="ghost">
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
        <StyledDeleteDatabaseModalTitle level={5}>
          Delete {databaseName}
        </StyledDeleteDatabaseModalTitle>
      }
      {...modalProps}
    >
      <StyledDeleteDatabaseModalBody level={2}>
        Are you sure you want to delete <b>{databaseName}</b>? You will lose all
        of the data, and will not be able to restore it later.
      </StyledDeleteDatabaseModalBody>
    </Modal>
  );
};

export default DeleteDatabaseModal;
