import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Row } from 'react-table';

import { Menu } from '@cognite/cogs.js';

import { MoreOptionsButton, ViewButton } from 'components/buttons';
import EmptyState from 'components/emptyState';
import { LOADING_TEXT } from 'components/emptyState/constants';
import { HoverDropdown } from 'components/hover-dropdown/HoverDropdown';
import { Options, Table } from 'components/tablev2';
import navigation from 'constants/navigation';
import { FavoriteContentWells } from 'modules/favorite/types';
import { SelectedMap } from 'modules/filterData/types';
import { wellSearchActions } from 'modules/wellSearch/actions';
import {
  useMutateFavoriteWellPatchWellbores,
  useMutateFavoriteWellUpdate,
} from 'modules/wellSearch/hooks/useWellsFavoritesQuery';
import { useFavoriteWellResults } from 'modules/wellSearch/selectors';
import { InspectWellboreContext, Well } from 'modules/wellSearch/types';
import { wellColumns, WellResultTableOptions } from 'pages/authorized/constant';
import {
  FAVORITE_SET_NO_WELLS,
  REMOVE_FROM_SET_TEXT,
} from 'pages/authorized/favorites/constants';
import { DeleteWellFromSetModal } from 'pages/authorized/favorites/modals';
import { FlexRow } from 'styles/layout';

import { FavoriteWellWrapper, RemoveFavoriteLabel } from './elements';
import { FavoriteWellboreTable } from './FavoriteWellBoreTable';
import { FavoriteWellsBulkActions } from './FavoriteWellsBulkActions';

export interface Props {
  removeWell: (wellId: number) => void;
  wells: FavoriteContentWells | undefined;
  favoriteId: string;
}

export const FavoriteWellsTable: React.FC<Props> = ({
  wells,
  removeWell,
  favoriteId,
}) => {
  const { t } = useTranslation('Favorites');
  const history = useHistory();
  const dispatch = useDispatch();
  const [wellIds, setWellIds] = useState<number[]>([]);
  const { data, isLoading } = useFavoriteWellResults(wellIds);
  const { mutate } = useMutateFavoriteWellPatchWellbores();
  const { mutate: mutateWells } = useMutateFavoriteWellUpdate();

  const [tableOptions] = useState<Options>(WellResultTableOptions);
  const [expandedIds, setExpandedIds] = useState<SelectedMap>({});
  const [selectedIds, setSelectedIds] = useState<SelectedMap>({});
  const [isDeleteWellModalOpen, setIsDeleteWellModalOpen] = useState(false);
  const [hoveredWell, setHoveredWell] = useState<Well>();

  const wellsData = useMemo(() => data || [], [data]);

  useEffect(() => {
    setWellIds(wells ? Object.keys(wells).map((key) => Number(key)) : []);
  }, [wells]);

  const columns = useMemo(
    () => Object.values(wellColumns || []),
    [wellColumns]
  );

  useEffect(() => {
    loadWells(wellIds || []);
  }, [wellIds]);

  const loadWells = (wellIds: number[]) => {
    mutateWells(wellIds);
  };

  const handleRowClick = useCallback(
    (row: Row<Well> & { isSelected: boolean }) => {
      const wellRow: Well = row.original;
      setExpandedIds((state) => ({
        ...state,
        [wellRow.id]: !state[wellRow.id],
      }));
    },
    []
  );

  const handleRowSelect = useCallback((well: Well) => {
    setSelectedIds((state) => ({
      ...state,
      [well.id]: !state[well.id],
    }));
  }, []);

  const handleRowsSelect = useCallback(
    (value: boolean) => {
      const selectedWellIdsList: SelectedMap = wellsData.reduce(
        (result, item) => {
          const selectedWellMap: SelectedMap = { [item.id]: value };
          return { ...result, ...selectedWellMap };
        },
        {}
      );

      setSelectedIds(selectedWellIdsList);
    },
    [wellsData]
  );

  const renderRowSubComponent = useCallback(({ row }) => {
    return <FavoriteWellboreTable well={row.original} />;
  }, []);

  const handleOpenDeleteModal = () => setIsDeleteWellModalOpen(true);
  const handleCloseDeleteModal = () => setIsDeleteWellModalOpen(false);

  const handleRemoveWell = () => {
    if (hoveredWell) {
      removeWell(hoveredWell.id);
      handleCloseDeleteModal();
    }
  };

  const handleHoverViewBtnClick = async (row: Row<Well>) => {
    const currentWell: Well = row.original;
    const isWellboresLoadedForWell = wellsData.some(
      (well) => well.id === currentWell.id && well.wellbores
    );

    await updateFavoriteStateInStore(currentWell.id, isWellboresLoadedForWell);
  };

  const updateFavoriteStateInStore = async (
    wellId: number,
    isWellboresLoadedForWell: boolean
  ) => {
    handleUpdatingFavoriteWellState(
      [wellId],
      InspectWellboreContext.FAVORITE_HOVERED_WELL
    );

    if (!isWellboresLoadedForWell) {
      await loadWellboresAndUpdateQueryCache(wellId);
      return;
    }
    navigateToInspectPanel();
  };

  const handleUpdatingFavoriteWellState = (
    wellIds: number[],
    inspectWellboreContext: InspectWellboreContext
  ) => {
    dispatch(wellSearchActions.setFavoriteHoveredOrCheckedWells(wellIds));
    dispatch(
      wellSearchActions.setWellboreInspectContext(inspectWellboreContext)
    );
    dispatch(wellSearchActions.setSelectedFavoriteId(favoriteId));
  };

  const loadWellboresAndUpdateQueryCache = async (wellId: number) => {
    await mutate({
      updatingWellIds: [wellId],
      successCallback: () => {
        navigateToInspectPanel();
      },
    });
  };

  const navigateToInspectPanel = () => {
    history.push(navigation.SEARCH_WELLS_INSPECT);
  };

  const getEmptyStateTitle = () => {
    if (isLoading) return t(LOADING_TEXT);
    if (wellIdsNotEmpty) return t(LOADING_TEXT);
    return t(FAVORITE_SET_NO_WELLS);
  };

  const wellIdsNotEmpty = wellIds && wellIds?.length > 0;

  const renderRowHoverComponent: React.FC<{
    row: Row<Well>;
  }> = ({ row }) => {
    const wellRow = row.original;
    return (
      <FlexRow>
        <ViewButton
          data-testid="button-view-document"
          onClick={() => handleHoverViewBtnClick(row)}
          hideIcon
        />
        <HoverDropdown
          content={
            <Menu>
              <Menu.Item
                onClick={() => {
                  handleOpenDeleteModal();
                  setHoveredWell(wellRow);
                }}
              >
                <RemoveFavoriteLabel data-testid="remove-from-set">
                  {t(REMOVE_FROM_SET_TEXT)}
                </RemoveFavoriteLabel>
              </Menu.Item>
            </Menu>
          }
        >
          <MoreOptionsButton data-testid="menu-button" />
        </HoverDropdown>
      </FlexRow>
    );
  };

  const isWellsLoading = isLoading || !wellsData.length;

  if (isWellsLoading) {
    return <EmptyState emptyTitle={getEmptyStateTitle()} />;
  }

  return (
    <FavoriteWellWrapper>
      <Table<Well>
        id="well-result-table"
        data={wellsData}
        columns={columns}
        renderRowSubComponent={renderRowSubComponent}
        handleRowClick={handleRowClick}
        handleRowSelect={handleRowSelect}
        handleRowsSelect={handleRowsSelect}
        expandedIds={expandedIds}
        options={tableOptions}
        selectedIds={selectedIds}
        renderRowHoverComponent={renderRowHoverComponent}
      />
      <FavoriteWellsBulkActions
        allWellIds={wellIds}
        selectedWellIdsList={selectedIds}
        deselectAll={() => handleRowsSelect(false)}
        favoriteId={favoriteId}
        favoriteWells={wells}
        handleUpdatingFavoriteWellState={handleUpdatingFavoriteWellState}
      />

      <DeleteWellFromSetModal
        title={hoveredWell?.name}
        onConfirm={handleRemoveWell}
        onClose={handleCloseDeleteModal}
        isOpen={isDeleteWellModalOpen}
      />
    </FavoriteWellWrapper>
  );
};
