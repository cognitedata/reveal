import React, { useState } from 'react';

import { Body, Checkbox, Flex, Modal, ModalProps } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import {
  MQTTSourceWithJobMetrics,
  useDeleteMQTTSource,
} from 'hooks/hostedExtractors';
import { useNavigate } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import { notification } from 'antd';

type DeleteSourceModalProps = {
  onCancel: () => void;
  source: MQTTSourceWithJobMetrics;
  visible: ModalProps['visible'];
};

const DeleteSourceModal = ({
  onCancel,
  source,
  visible,
}: DeleteSourceModalProps): JSX.Element => {
  const { t } = useTranslation();

  const [isChecked, setIsChecked] = useState(false);

  const navigate = useNavigate();

  const { mutate: deleteSource } = useDeleteMQTTSource({
    onSuccess: () => {
      notification.success({
        message: t('notification-success-source-delete'),
        key: 'delete-source',
      });
      navigate(createLink('/extpipes', { tab: 'hosted' }));
    },
    onError: (e: any) => {
      notification.error({
        message: e.toString(),
        key: 'delete-source',
      });
    },
  });

  const handleDelete = (): void => {
    deleteSource({ externalId: source.externalId });
  };

  return (
    <Modal
      destructive
      onCancel={onCancel}
      okDisabled={!isChecked}
      okText={t('delete')}
      onOk={handleDelete}
      title={t('delete-source')}
      visible={visible}
    >
      <Flex direction="column" gap={12}>
        <Body level={2}>{t('delete-source-warning')}</Body>
        <Checkbox
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
        >
          {t('delete-source-checkbox')}
        </Checkbox>
      </Flex>
    </Modal>
  );
};

export default DeleteSourceModal;
