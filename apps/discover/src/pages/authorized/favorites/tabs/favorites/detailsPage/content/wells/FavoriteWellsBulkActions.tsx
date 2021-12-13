import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import sum from 'lodash/sum';

import { Button } from '@cognite/cogs.js';

import { CloseButton, ViewButton } from 'components/buttons';
import TableBulkActions from 'components/table-bulk-actions';
import navigation from 'constants/navigation';
import { useDeepMemo } from 'hooks/useDeep';
import { useFavoriteUpdateContent } from 'modules/api/favorites/useFavoritesQuery';
import { FavoriteContentWells } from 'modules/favorite/types';
import { SelectedMap } from 'modules/filterData/types';
import { useMutateFavoriteWellPatchWellbores } from 'modules/wellSearch/hooks/useWellsFavoritesQuery';
import { useFavoriteWellResults } from 'modules/wellSearch/selectors';
import { InspectWellboreContext, Well, WellId } from 'modules/wellSearch/types';
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
  handleUpdatingFavoriteWellState: (
    wellIds: WellId[],
    inspectWellboreContext: InspectWellboreContext
  ) => void;
  selectedWellboresList: FavoriteContentWells;
}
export const FavoriteWellsBulkActions: React.FC<Props> = ({
  selectedWellIdsList,
  allWellIds,
  deselectAll,
  favoriteId,
  favoriteWells = {},
  handleUpdatingFavoriteWellState,
  selectedWellboresList,
}) => {
  const { t } = useTranslation('Search');
  const { mutateAsync: mutateFavoriteContent } = useFavoriteUpdateContent();
  const { data: wells } = useFavoriteWellResults(allWellIds);
  const { mutate } = useMutateFavoriteWellPatchWellbores();
  const history = useHistory();
  const [isDeleteWellModalOpen, setIsDeleteWellModalOpen] = useState(false);

  const selectedWellIds: WellId[] = useMemo(() => {
    return Object.keys(selectedWellIdsList).filter(
      (key: WellId) => selectedWellIdsList[key]
    );
  }, [selectedWellIdsList]);

  const selectedWellIdsCount = useMemo(
    () => selectedWellIds.length,
    [selectedWellIds]
  );

  const selectedWellboreIdsCount = useDeepMemo(
    () =>
      sum(
        Object.values(selectedWellboresList).flatMap((item) => [item.length])
      ),
    [selectedWellboresList]
  );

  const handleOpenDeleteModal = () => setIsDeleteWellModalOpen(true);
  const handleCloseDeleteModal = () => setIsDeleteWellModalOpen(false);

  const handleClickView = () => {
    const prestineWellIds = getPrestineWellIds();

    loadWellboresAndUpdateQueryCache(prestineWellIds);
  };

  const getPrestineWellIds = () => {
    return selectedWellIds.reduce((acc: number[], wellId: WellId) => {
      const well = wells?.find((item) => item.id === wellId);
      if (!well) return acc;

      if (!isWellContainsWellbores(well)) {
        return [...acc, wellId];
      }
      return acc;
    }, []);
  };

  const isWellContainsWellbores = (well?: Well) =>
    well?.wellbores && well.wellbores.length;

  const loadWellboresAndUpdateQueryCache = async (wellIds: WellId[]) => {
    await mutate({
      updatingWellIds: wellIds,
      successCallback: () => {
        handleUpdatingFavoriteWellState(
          selectedWellIds,
          InspectWellboreContext.FAVORITE_CHECKED_WELLS
        );
        navigateToInspectPanel();
      },
    });
  };

  const navigateToInspectPanel = () => {
    history.push(navigation.SEARCH_WELLS_INSPECT);
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
    let newFavoriteWells: FavoriteContentWells = favoriteWells;

    if (!favoriteWells) return;

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
