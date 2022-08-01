import React, { useContext } from 'react';

import { Body, Button, Colors, Title } from '@cognite/cogs.js';
import { notification } from 'antd';
import styled from 'styled-components';

import Modal, { ModalProps } from 'components/Modal/Modal';
import { RawExplorerContext } from 'contexts';
import { useDeleteDatabase } from 'hooks/sdk-queries';
import { useCloseDatabase } from 'hooks/table-tabs';
import { Trans, useTranslation } from 'common/i18n';

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
  const { t } = useTranslation();
  const { setSelectedSidePanelDatabase } = useContext(RawExplorerContext);

  const { mutate: deleteDatabase, isLoading } = useDeleteDatabase();
  const closeDatabase = useCloseDatabase();

  const handleDelete = (): void => {
    deleteDatabase(
      { database: databaseName },
      {
        onSuccess: () => {
          notification.success({
            message: t('delete-database-notification_success', {
              name: databaseName,
            }),
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
                <p>
                  {t('delete-database-notification_error', {
                    name: databaseName,
                  })}
                </p>
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
          {t('cancel')}
        </StyledCancelButton>,
        <Button
          disabled={isLoading}
          loading={isLoading}
          onClick={handleDelete}
          type="danger"
        >
          {t('delete-database-modal-button-delete')}
        </Button>,
      ]}
      onCancel={onCancel}
      title={
        <StyledDeleteDatabaseModalTitle level={5}>
          {t('delete-database-modal-title', { name: databaseName })}
        </StyledDeleteDatabaseModalTitle>
      }
      {...modalProps}
    >
      <StyledDeleteDatabaseModalBody level={2}>
        <Trans
          i18nKey="delete-database-modal-body"
          values={{ name: databaseName }}
        />
      </StyledDeleteDatabaseModalBody>
    </Modal>
  );
};

export default DeleteDatabaseModal;
