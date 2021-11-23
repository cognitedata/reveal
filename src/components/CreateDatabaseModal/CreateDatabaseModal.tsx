import React, { ChangeEvent, useContext, useEffect, useState } from 'react';

import { Body, Button, Detail, Input, Title } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk';
import { notification } from 'antd';
import styled from 'styled-components';

import Modal, { ModalProps } from 'components/Modal/Modal';
import { RawExplorerContext } from 'contexts';
import { useCreateDatabase } from 'hooks/sdk-queries';

type CreateDatabaseModalProps = {
  databases: RawDB[];
} & Omit<ModalProps, 'children' | 'onOk' | 'title'>;

const StyledCancelButton = styled(Button)`
  margin-right: 8px;
`;

const CreateDatabaseModal = ({
  databases,
  onCancel,
  visible,
  ...modalProps
}: CreateDatabaseModalProps): JSX.Element => {
  const { setSelectedSidePanelDatabase } = useContext(RawExplorerContext);

  const [databaseName, setDatabaseName] = useState('');

  const { mutate: createDatabase, isLoading } = useCreateDatabase();

  const isUnique = !databases.some(({ name }) => name === databaseName);
  const isDisabled =
    databaseName.length === 0 ||
    databaseName.length > 32 ||
    !isUnique ||
    isLoading;

  useEffect(() => {
    if (!visible) {
      setDatabaseName('');
    }
  }, [visible]);

  const handleCreate = (): void => {
    createDatabase(
      { name: databaseName },
      {
        onSuccess: () => {
          notification.success({
            message: `Database ${databaseName} created!`,
            key: 'create-database',
          });
          onCancel();
          setSelectedSidePanelDatabase(databaseName);
        },
        onError: (e: any) => {
          notification.error({
            message: (
              <p>
                <p>Database {databaseName} was not created!</p>
                <pre>{JSON.stringify(e?.errors, null, 2)}</pre>
              </p>
            ),
            key: 'create-database',
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
          disabled={isDisabled}
          loading={isLoading}
          onClick={handleCreate}
          type="primary"
        >
          Create
        </Button>,
      ]}
      onCancel={onCancel}
      title={<Title level={5}>Create database</Title>}
      visible={visible}
      {...modalProps}
    >
      <Body level={2} strong>
        Name
      </Body>
      <Input
        autoFocus
        disabled={isLoading}
        fullWidth
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setDatabaseName(e.target.value)
        }
        onKeyUp={(e) => {
          if (!isDisabled && e.key === 'Enter') {
            handleCreate();
          }
        }}
        placeholder="Enter name"
        value={databaseName}
      />
      <Detail>
        The name should be unique. You can not change this name later.
      </Detail>
    </Modal>
  );
};

export default CreateDatabaseModal;
