import React from 'react';
import { useTranslation } from 'react-i18next';

import { Modal } from 'components/modal';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { FavoriteSummary } from 'modules/favorite/types';

import {
  DELETE_SET_CONFIRM_BUTTON,
  DELETE_FAVORITE_MODAL_TEXT,
} from '../../constants';

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (item: FavoriteSummary) => void;
  item?: FavoriteSummary;
}

const DeleteFavoriteSetModal: React.FC<Props> = ({
  isOpen,
  onConfirm,
  onCancel,
  item,
}) => {
  const { t } = useTranslation('UserProfile');
  const metrics = useGlobalMetrics('favorites');

  const handleConfirm = () => {
    if (item) {
      onConfirm(item);
      metrics.track('click-confirm-delete-set-button');
    }
  };

  const handleCancel = () => {
    metrics.track('click-cancel-delete-set-button');
    onCancel();
  };

  return (
    <Modal
      visible={isOpen}
      okText={t(DELETE_SET_CONFIRM_BUTTON)}
      onOk={handleConfirm}
      onCancel={handleCancel}
      title={`${t('Deleting set')} "${item?.name || ''}"`}
    >
      {t(DELETE_FAVORITE_MODAL_TEXT)}
    </Modal>
  );
};

export default DeleteFavoriteSetModal;
