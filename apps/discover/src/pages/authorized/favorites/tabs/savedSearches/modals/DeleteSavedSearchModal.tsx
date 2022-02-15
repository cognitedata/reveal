import React from 'react';
import { useTranslation } from 'react-i18next';

import { SavedSearchItem } from 'services/savedSearches/types';

import { Button } from '@cognite/cogs.js';

import { Modal } from 'components/modal';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';

import { DELETE_SAVED_SEARCH_CONFIRM_BUTTON_TEXT } from '../constants';

export const getModalText = (savedSearchName: string | undefined) =>
  `Are you sure you want to delete the "${savedSearchName}" saved search from the list?`;

export interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (item: SavedSearchItem) => void;
  item?: SavedSearchItem;
}

export const DeleteSavedSearchModal: React.FC<Props> = ({
  isOpen,
  onConfirm,
  onCancel,
  item,
}) => {
  const { t } = useTranslation('UserProfile');
  const metrics = useGlobalMetrics('saved-searches');

  const modalText = getModalText(item?.name);

  const handleConfirm = () => {
    if (item) {
      onConfirm(item);
      metrics.track('click-confirm-delete-saved-search-button');
    }
  };

  const handleCancel = () => {
    metrics.track('click-cancel-delete-saved-search-button');
    onCancel();
  };

  const footer = (
    <div className="cogs-modal-footer-buttons">
      <Button
        type="secondary"
        onClick={handleCancel}
        data-testid="cancel-delete-saved-search"
      >
        Cancel
      </Button>

      <Button
        type="danger"
        onClick={handleConfirm}
        data-testid="confirm-delete-saved-search"
      >
        {t(DELETE_SAVED_SEARCH_CONFIRM_BUTTON_TEXT)}
      </Button>
    </div>
  );

  return (
    <Modal
      visible={isOpen}
      title={`${t('Deleting saved search')}`}
      footer={footer}
      onCancel={handleCancel}
    >
      <div data-testid="delete-saved-search-modal-container">
        {t(modalText)}
      </div>
    </Modal>
  );
};
