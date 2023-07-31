import * as React from 'react';

import { Modal } from 'components/Modal';
import { useTranslation } from 'hooks/useTranslation';

import { OVERWRITE_SEARCH_MODAL_TEXT } from '../constants';

export interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const OverwriteSearchModal: React.FC<Props> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={isOpen}
      onCancel={onCancel}
      okText={t('Overwrite search')}
      onOk={() => onConfirm()}
      title={t('Overwriting search')}
    >
      {t(OVERWRITE_SEARCH_MODAL_TEXT)}
    </Modal>
  );
};
