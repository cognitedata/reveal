import React from 'react';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components/macro';

import { Modal } from 'components/modal';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';

const Title = styled.span`
  margin-bottom: 8px;
  font-weight: 600;
`;

interface Props {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  singleItem?: boolean;
}

export const DeleteWellFromSetModal: React.FC<Props> = (props) => {
  const { isOpen, title, onClose, onConfirm, singleItem = true } = props;
  const { t } = useTranslation('Favorites');
  const metrics = useGlobalMetrics('favorites');

  const deleteFromSet = () => {
    metrics.track('click-confirm-delete-well-from-set-button');
    onConfirm();
  };

  const handleCancel = () => {
    metrics.track('click-cancel-delete-well-from-set-button');
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      onCancel={handleCancel}
      onOk={deleteFromSet}
      okText={t('Remove')}
      title={t('Notice')}
    >
      <span>
        {t('Are you sure you want to remove the')}{' '}
        {title ? <Title>{title}</Title> : ''} {singleItem ? 'well' : 'wells'}{' '}
        from the set?
      </span>
    </Modal>
  );
};

export default DeleteWellFromSetModal;
