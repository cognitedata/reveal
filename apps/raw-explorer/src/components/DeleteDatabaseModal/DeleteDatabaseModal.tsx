import React, { useContext } from 'react';

import styled from 'styled-components';

import { Trans, useTranslation } from '@raw-explorer/common/i18n';
import { RawExplorerContext } from '@raw-explorer/contexts';
import { useDeleteDatabase } from '@raw-explorer/hooks/sdk-queries';
import { useCloseDatabase } from '@raw-explorer/hooks/table-tabs';
import { notification } from 'antd';

import { Body, Colors, Modal, ModalProps } from '@cognite/cogs.js';

type DeleteDatabaseModalProps = {
  databaseName: string;
} & Omit<ModalProps, 'children' | 'onOk' | 'title'>;

const StyledDeleteDatabaseModalBody = styled(Body)`
  color: ${Colors['text-icon--strong']};
`;

const DeleteDatabaseModal = ({
  databaseName,
  onCancel,
  visible,
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
          setSelectedSidePanelDatabase(undefined);
          closeDatabase([databaseName]);
        },
        onError: (e) => {
          notification.error({
            message: t('delete-database-notification_error', {
              name: databaseName,
            }),
            description:
              e.status === 403 ? (
                <Trans i18nKey="explorer-side-panel-databases-delete-warning-no-access" />
              ) : (
                e.message
              ),
            key: 'database-delete',
          });
        },
      }
    );
  };

  return (
    <Modal
      onOk={handleDelete}
      okText={t('delete-database-modal-button-delete')}
      okDisabled={isLoading}
      onCancel={onCancel}
      title={t('delete-database-modal-title', { name: databaseName })}
      visible={visible}
      size="small"
      destructive
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
