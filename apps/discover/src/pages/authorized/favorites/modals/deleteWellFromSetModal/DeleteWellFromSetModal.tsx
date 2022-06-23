import React from 'react';

import styled from 'styled-components/macro';

import { Modal } from 'components/Modal';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useTranslation } from 'hooks/useTranslation';

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
  isWell?: boolean;
}

export const DeleteWellFromSetModal: React.FC<Props> = ({
  isOpen,
  title,
  onClose,
  onConfirm,
  singleItem = true,
  isWell = true,
}) => {
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

  const wellOrWellbore = isWell ? ' well' : ' wellbore';

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
        {title ? <Title>{title}</Title> : ''}
        {singleItem ? wellOrWellbore : wellOrWellbore.concat('s')} from the set?
      </span>
    </Modal>
  );
};

export default DeleteWellFromSetModal;
