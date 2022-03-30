import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import isEmpty from 'lodash/isEmpty';

import { Button } from '@cognite/cogs.js';

import { CloseButton, ViewButton } from 'components/buttons';
import TableBulkActions from 'components/table-bulk-actions';
import { FavoriteContentWells } from 'modules/favorite/types';
import { REMOVE_FROM_SET_TEXT } from 'pages/authorized/favorites/constants';
import { DeleteWellFromSetModal } from 'pages/authorized/favorites/modals';
import {
  CLEAR_SELECTION_TEXT,
  VIEW_SELECTED_WELL_TEXT,
} from 'pages/authorized/search/well/content/constants';

export interface Props {
  selectedWellsAndWellbores: FavoriteContentWells;
  deselectAll: () => void;
  onViewWellbores: () => void;
  onRemoveWellsAndWellbores: () => void;
}
export const FavoriteWellsBulkActions: React.FC<Props> = ({
  selectedWellsAndWellbores,
  deselectAll,
  onViewWellbores,
  onRemoveWellsAndWellbores,
}) => {
  const { t } = useTranslation('Search');
  const [isDeleteWellModalOpen, setIsDeleteWellModalOpen] = useState(false);

  const selectedWellIdsCount = Object.keys(selectedWellsAndWellbores).reduce(
    (previousValue, currentValue) => {
      return (
        previousValue +
        (isEmpty(selectedWellsAndWellbores[currentValue]) ? 0 : 1)
      );
    },
    0
  );
  const selectedWellboreIdsCount = Object.values(
    selectedWellsAndWellbores
  ).reduce((previousValue, currentValue) => {
    return previousValue + (currentValue?.length || 0);
  }, 0);

  const handleOpenDeleteModal = () => setIsDeleteWellModalOpen(true);
  const handleCloseDeleteModal = () => setIsDeleteWellModalOpen(false);

  const handleClickView = () => {
    onViewWellbores();
  };

  const bulkActionTitle = `${selectedWellIdsCount} ${
    selectedWellIdsCount > 1 ? 'wells' : 'well'
  } selected`;

  const subtitle = `With ${selectedWellboreIdsCount} ${
    selectedWellboreIdsCount > 1 ? 'wellbores' : 'wellbore'
  } inside`;

  const removeAllWells = (): void => {
    onRemoveWellsAndWellbores();
    handleCloseDeleteModal();
  };

  const isVisible = selectedWellIdsCount > 0 || selectedWellboreIdsCount > 0;

  return (
    <>
      {isVisible && (
        <>
          <TableBulkActions
            isVisible={isVisible}
            title={bulkActionTitle}
            subtitle={subtitle}
          >
            <ViewButton
              variant="inverted"
              size="default"
              tooltip={t(VIEW_SELECTED_WELL_TEXT)}
              onClick={handleClickView}
              aria-label={VIEW_SELECTED_WELL_TEXT}
              hideIcon
            />

            <Button
              type="primary"
              onClick={handleOpenDeleteModal}
              aria-label="remove from set"
            >
              {t(REMOVE_FROM_SET_TEXT)}
            </Button>

            <TableBulkActions.Separator />

            <CloseButton
              variant="inverted"
              tooltip={t(CLEAR_SELECTION_TEXT)}
              onClick={deselectAll}
              aria-label={CLEAR_SELECTION_TEXT}
              data-testid="close-btn"
            />
          </TableBulkActions>
          <DeleteWellFromSetModal
            title={selectedWellIdsCount.toString()}
            onConfirm={removeAllWells}
            onClose={handleCloseDeleteModal}
            isOpen={isDeleteWellModalOpen}
            singleItem={selectedWellIdsCount <= 1}
          />
        </>
      )}
    </>
  );
};
