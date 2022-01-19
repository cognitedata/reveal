import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import pickBy from 'lodash/pickBy';

import { Button } from '@cognite/cogs.js';

import { CloseButton, ViewButton } from 'components/buttons';
import TableBulkActions from 'components/table-bulk-actions';
import { useDeepMemo } from 'hooks/useDeep';
import { useFavoriteUpdateContent } from 'modules/api/favorites/useFavoritesMutate';
import { FavoriteContentWells } from 'modules/favorite/types';
import { SelectedMap } from 'modules/filterData/types';
import { useNavigateToWellInspect } from 'modules/wellInspect/hooks/useNavigateToWellInspect';
import { useWellsByIds } from 'modules/wellSearch/hooks/useWellsCacheQuerySelectors';
import { WellId } from 'modules/wellSearch/types';
import { REMOVE_FROM_SET_TEXT } from 'pages/authorized/favorites/constants';
import { DeleteWellFromSetModal } from 'pages/authorized/favorites/modals';
import {
  CLEAR_SELECTION_TEXT,
  VIEW_SELECTED_WELL_TEXT,
} from 'pages/authorized/search/well/content/constants';

export interface Props {
  allWellIds?: number[];
  selectedWellIdsList: SelectedMap;
  deselectAll: () => void;
  favoriteId: string;
  favoriteWells: FavoriteContentWells | undefined;
  selectedWellboresList: FavoriteContentWells;
}
export const FavoriteWellsBulkActions: React.FC<Props> = ({
  selectedWellIdsList,
  allWellIds,
  deselectAll,
  favoriteId,
  favoriteWells = {},
  selectedWellboresList,
}) => {
  const { t } = useTranslation('Search');
  const navigateToWellInspect = useNavigateToWellInspect();
  const { mutateAsync: mutateFavoriteContent } = useFavoriteUpdateContent();
  const wells = useWellsByIds(allWellIds);
  const [isDeleteWellModalOpen, setIsDeleteWellModalOpen] = useState(false);

  const selectedWellIds: WellId[] = useDeepMemo(
    () => Object.keys(pickBy(selectedWellIdsList)),
    [selectedWellIdsList]
  );

  const selectedWellboreIds: WellId[] = useDeepMemo(
    () => flatten(Object.values(selectedWellboresList)),
    [selectedWellIdsList]
  );

  const selectedWellIdsCount = selectedWellIds.length;
  const selectedWellboreIdsCount = selectedWellboreIds.length;

  const handleOpenDeleteModal = () => setIsDeleteWellModalOpen(true);
  const handleCloseDeleteModal = () => setIsDeleteWellModalOpen(false);

  const handleClickView = () => {
    navigateToWellInspect({
      wellIds: selectedWellIds,
      wellboreIds: selectedWellboreIds,
    });
  };

  const bulkActionTitle = `${selectedWellIdsCount} ${
    selectedWellIdsCount > 1 ? 'wells' : 'well'
  } selected`;

  const subtitle = `With ${selectedWellboreIdsCount} ${
    selectedWellboreIdsCount > 1 ? 'wellbores' : 'wellbore'
  } inside`;

  const removeAllWells = (): void => {
    removeSelectedWellboresAndWells();
    deselectAll();
  };

  const removeSelectedWellboresAndWells = (): void => {
    let newFavoriteWells: FavoriteContentWells = { ...favoriteWells };
    if (!favoriteWells) return;

    if (
      isEmpty(selectedWellboresList) &&
      Object.values(selectedWellIdsList).every((isSelected) => isSelected)
    ) {
      newFavoriteWells = {};
    } else {
      Object.keys(selectedWellboresList).forEach((wellId) => {
        // checking favorite well contains all the wellbores(denoted as empty []), then remove selected wellbores
        if (isEmpty(favoriteWells[wellId])) {
          newFavoriteWells[wellId] = getRemainingWellboreList(wellId);
        } else {
          newFavoriteWells[wellId] = favoriteWells[wellId].filter(
            (wellboreId) => !selectedWellboresList[wellId].includes(wellboreId)
          );
        }
        // removing well if no wellbore is left after removing wellbores
        if (isEmpty(newFavoriteWells[wellId])) {
          newFavoriteWells = omit(newFavoriteWells, wellId);
        }
      });
    }

    removeFromQueryCache(newFavoriteWells);
  };

  const getRemainingWellboreList = (wellId: WellId): string[] => {
    return (
      wells
        .find((well) => isEqual(String(well.id), wellId))
        ?.wellbores?.filter(
          (wellbore) => !selectedWellboresList[wellId].includes(wellbore.id)
        )
        .flatMap((wellbore) => String([wellbore.id])) || []
    );
  };

  const removeFromQueryCache = (favoriteWells: FavoriteContentWells): void => {
    mutateFavoriteContent({
      id: favoriteId,
      updateData: {
        wells: favoriteWells,
      },
    });
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
