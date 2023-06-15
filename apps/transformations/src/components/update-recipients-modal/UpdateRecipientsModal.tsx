import { useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import {
  useCreateNotification,
  useDeleteNotification,
} from '@transformations/hooks';
import { Notification, TransformationRead } from '@transformations/types';
import { getTrackEvent } from '@transformations/utils';
import { Input, notification } from 'antd';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { isValidEmail } from '@cognite/cdf-utilities';
import { Body, Button, Colors, Flex, Title, Modal } from '@cognite/cogs.js';

type UpdateRecipientsProps = {
  notifications: Notification[] | undefined;
  onCancel: () => void;
  open: boolean;
  transformationId: TransformationRead['id'];
};

const UpdateRecipients = ({
  notifications,
  onCancel,
  transformationId,
  open,
}: UpdateRecipientsProps): JSX.Element => {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');

  const { isLoading: isCreatingNotification, mutate: createNotification } =
    useCreateNotification();
  const { isLoading: isDeletingNotification, mutate: deleteNotification } =
    useDeleteNotification();

  const isEmailValid = isValidEmail(email);

  const handleCreateNotification = (): void => {
    if (isEmailValid) {
      trackEvent(
        getTrackEvent('event-tr-details-home-notifications-add-click')
      );
      createNotification(
        {
          destination: email,
          transformationId,
        },
        {
          onSuccess: () => {
            setEmail('');
            notification.success({
              message: t('notification-success'),
              description: t('notification-recipient-added'),
            });
          },
          onError: (error: any) => {
            notification.error({
              message: t('notification-failed'),
              description: error?.message,
            });
          },
        }
      );
    }
  };

  const handleDeleteNotification = (id: Notification['id']): void => {
    deleteNotification(
      {
        id,
        transformationId,
      },
      {
        onSuccess: () => {
          notification.success({
            message: t('notification-success'),
            description: t('notification-recipient-deleted'),
          });
        },
        onError: (error: any) => {
          notification.error({
            message: t('notification-failed'),
            description: error?.message,
          });
        },
      }
    );
  };

  return (
    <Modal
      onCancel={onCancel}
      onOk={onCancel}
      okText={t('done')}
      cancelText={t('cancel')}
      title={t('notification-settings')}
      visible={open}
    >
      <Flex direction="column" gap={8}>
        <ModalTextBody>{t('specify-email-addresses')}</ModalTextBody>
        <Title level={6}>{t('recipients')}</Title>

        <Flex direction="column" gap={12} style={{ marginBottom: 12 }}>
          <Flex gap={12}>
            <Input
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('email-placeholder')}
              value={email}
            />
            <Button
              loading={isCreatingNotification}
              disabled={!isEmailValid}
              onClick={handleCreateNotification}
              size="small"
              type="primary"
            >
              {t('add')}
            </Button>
          </Flex>
        </Flex>
        {notifications?.map(({ id, destination: recipient }) => (
          <StyledRecipientContainer key={recipient}>
            <Body level={2}>{recipient}</Body>
            <Button
              icon="Delete"
              loading={isDeletingNotification}
              onClick={() => handleDeleteNotification(id)}
              size="small"
              type="ghost"
            />
          </StyledRecipientContainer>
        ))}
      </Flex>
    </Modal>
  );
};

const ModalTextBody = styled.p`
  color: ${Colors['text-icon--muted']};
`;

const StyledRecipientContainer = styled.div`
  align-items: center;
  background-color: ${Colors['surface--strong']};
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
`;

export default UpdateRecipients;
