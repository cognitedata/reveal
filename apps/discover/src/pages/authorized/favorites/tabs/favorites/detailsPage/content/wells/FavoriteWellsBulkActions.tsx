import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import omit from 'lodash/omit';

import { Button } from '@cognite/cogs.js';

import { CloseButton, ViewButton } from 'components/buttons';
import TableBulkActions from 'components/table-bulk-actions';
import navigation from 'constants/navigation';
import { useFavoriteUpdateContent } from 'modules/api/favorites/useFavoritesQuery';
import { FavoriteContentWells } from 'modules/favorite/types';
import { SelectedMap } from 'modules/filterData/types';
import { useMutateFavoriteWellPatchWellbores } from 'modules/wellSearch/hooks/useWellsFavoritesQuery';
import { useFavoriteWellResults } from 'modules/wellSearch/selectors';
import { InspectWellboreContext, Well } from 'modules/wellSearch/types';
import { REMOVE_FROM_SET_TEXT } from 'pages/authorized/favorites/constants';
import { DeleteWellFromSetModal } from 'pages/authorized/favorites/modals';

export interface Props {
  allWellIds?: number[];
  selectedWellIdsList: SelectedMap;
  deselectAll: () => void;
  favoriteId: string;
  favoriteWells: FavoriteContentWells | undefined;
  handleUpdatingFavoriteWellState: (
    wellIds: number[],
    inspectWellboreContext: InspectWellboreContext
  ) => void;
}
export const FavoriteWellsBulkActions: React.FC<Props> = ({
  selectedWellIdsList,
  allWellIds,
  deselectAll,
  favoriteId,
  favoriteWells,
  handleUpdatingFavoriteWellState,
}) => {
  const { t } = useTranslation('Search');
  const { mutateAsync: mutateFavoriteContent } = useFavoriteUpdateContent();
  const { data: wells } = useFavoriteWellResults(allWellIds);
  const { mutate } = useMutateFavoriteWellPatchWellbores();
  const history = useHistory();
  const [isDeleteWellModalOpen, setIsDeleteWellModalOpen] = useState(false);

  const selectedWellIds: number[] = useMemo(() => {
    return Object.keys(selectedWellIdsList)
      .filter((key) => selectedWellIdsList[Number(key)])
      .map(Number);
  }, [selectedWellIdsList]);

  const selectedWellIdsCount = useMemo(
    () => selectedWellIds.length,
    [selectedWellIds]
  );

  const handleOpenDeleteModal = () => setIsDeleteWellModalOpen(true);
  const handleCloseDeleteModal = () => setIsDeleteWellModalOpen(false);

  const handleClickView = () => {
    const prestineWellIds = getPrestineWellIds();

    loadWellboresAndUpdateQueryCache(prestineWellIds);
  };

  const getPrestineWellIds = () => {
    return selectedWellIds.reduce((acc: number[], wellId: number) => {
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

  const loadWellboresAndUpdateQueryCache = async (wellIds: number[]) => {
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

  const removeAllWells = () => {
    removeFromQueryCache();
    deselectAll();
  };

  const removeFromQueryCache = () => {
    mutateFavoriteContent({
      id: favoriteId,
      updateData: {
        wells: favoriteWells ? omit(favoriteWells, selectedWellIds) : undefined,
      },
    });
  };

  const isVisible = selectedWellIdsCount > 0;

  return (
    <>
      {isVisible && (
        <>
          <TableBulkActions isVisible={isVisible} title={bulkActionTitle}>
            <ViewButton
              variant="inverted"
              size="default"
              tooltip={t('View the selected wells')}
              onClick={handleClickView}
              aria-label="View the selected wells"
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
              tooltip={t('Clear selection')}
              onClick={deselectAll}
              aria-label="Clear selection"
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
