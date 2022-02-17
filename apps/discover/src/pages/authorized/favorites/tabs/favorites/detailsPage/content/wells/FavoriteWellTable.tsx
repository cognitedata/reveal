import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import map from 'lodash/map';

import { Menu, Dropdown } from '@cognite/cogs.js';

import { MoreOptionsButton, ViewButton } from 'components/buttons';
import EmptyState from 'components/emptyState';
import { LOADING_TEXT } from 'components/emptyState/constants';
import { Options, Table, RowProps } from 'components/tablev3';
import { useDeepCallback, useDeepEffect } from 'hooks/useDeep';
import { FavoriteContentWells } from 'modules/favorite/types';
import { SelectedMap } from 'modules/filterData/types';
import { useNavigateToWellInspect } from 'modules/wellInspect/hooks/useNavigateToWellInspect';
import { useWellsCacheQuery } from 'modules/wellSearch/hooks/useWellsCacheQuery';
import { Well, WellboreId, WellId } from 'modules/wellSearch/types';
import { WellResultTableOptions } from 'pages/authorized/constant';
import {
  FAVORITE_SET_NO_WELLS,
  REMOVE_FROM_SET_TEXT,
} from 'pages/authorized/favorites/constants';
import { DeleteWellFromSetModal } from 'pages/authorized/favorites/modals';
import { useDataForTable } from 'pages/authorized/search/well/content/result/useDataForTable';
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
  const [wellIds, setWellIds] = useState<WellId[]>([]);
  const { data, isLoading } = useWellsCacheQuery(wellIds);
  const navigateToWellInspect = useNavigateToWellInspect();

  const [tableOptions] = useState<Options>(WellResultTableOptions);
  const [expandedIds, setExpandedIds] = useState<SelectedMap>({});
  const [selectedWellIds, setSelectedWellIds] = useState<SelectedMap>({});
  const [isDeleteWellModalOpen, setIsDeleteWellModalOpen] = useState(false);
  const [hoveredWell, setHoveredWell] = useState<Well>();

  const [selectedWellboreIdsWithWellId, setSelectedWellboreIdsWithWellId] =
    useState<FavoriteContentWells>({});

  useDeepEffect(() => setWellIds(wells ? Object.keys(wells) : []), [wells]);

  const { columns } = useDataForTable();

  const handleRowClick = useCallback(
    (row: RowProps<Well> & { isSelected: boolean }) => {
      const wellRow: Well = row.original;
      setExpandedIds((state) => ({
        ...state,
        [wellRow.id]: !state[wellRow.id],
      }));
    },
    []
  );

  // TODO(PP-2504): The whole selection and complicated logic needs to be refactored and unit-tested
  const handleRowSelect = useCallback((row: RowProps<Well>) => {
    setExpandedIds((state) => ({
      ...state,
      [row.original.id]: true,
    }));
    setSelectedWellIds((state) => {
      setWellbores(row.original, state[row.original.id]);
      return {
        ...state,
        [row.original.id]: !state[row.original.id],
      };
    });
  }, []);

  const setWellbores = (well: Well, isContain: boolean): void => {
    const wellbores = getContainWellbores(well);
    setSelectedWellboreIdsWithWellId((prevState) =>
      isContain
        ? { ...prevState, [well.id]: [] }
        : {
            ...prevState,
            [well.id]: wellbores
              ? wellbores.flatMap((wellbore) => [wellbore])
              : [],
          }
    );
  };

  const getContainWellbores = (well: Well) => {
    if (!wells) return [];
    return isEmpty(wells[well.id])
      ? well.wellbores?.flatMap((item) => item.id)
      : wells[well.id];
  };

  const handleRowsSelect = useCallback(
    (value: boolean) => {
      const selectedWellIdsList: SelectedMap = (data || []).reduce(
        (result, item) => {
          const selectedWellMap: SelectedMap = { [item.id]: value };
          return { ...result, ...selectedWellMap };
        },
        {}
      );

      setSelectedWellIds(selectedWellIdsList);
      Object.keys(selectedWellIdsList).forEach((wellId) => {
        const well = data?.find((well) => well.id === wellId);
        if (well) {
          setWellbores(well, !value);
        }
      });
    },
    [data]
  );

  const setWellboreIds = (wellId: WellId, wellboreId: WellboreId) => {
    setSelectedWellboreIdsWithWellId((preState) =>
      assignWellsWithWellbores(preState, wellId, wellboreId)
    );
  };

  const assignWellsWithWellbores = (
    preState: FavoriteContentWells,
    wellId: WellId,
    wellboreId: WellboreId
  ): FavoriteContentWells => {
    if (preState[wellId] && preState[wellId].includes(wellboreId)) {
      const newState: FavoriteContentWells = {
        ...preState,
        [wellId]: preState[wellId].filter((item) => !isEqual(item, wellboreId)),
      };
      if (isEmpty(newState[wellId])) {
        setSelectedWellIds((state) => ({ ...state, [wellId]: false }));
      }
      return newState;
    }
    setSelectedWellIds((state) => ({ ...state, [wellId]: true }));

    return {
      ...preState,
      [wellId]: preState[wellId]
        ? preState[wellId].concat([wellboreId])
        : [wellboreId],
    };
  };

  const renderRowSubComponent = useDeepCallback(
    ({ row }) => {
      const wellbores: WellboreId[] = wells ? wells[row.original.id] : [];

      return (
        <FavoriteWellboreTable
          well={row.original}
          wellboreIds={wellbores}
          favoriteContentWells={wells || {}}
          favoriteId={favoriteId}
          removeWell={removeWell}
          selectedWellbores={
            selectedWellboreIdsWithWellId[row.original.id] || []
          }
          setWellboreIds={setWellboreIds}
        />
      );
    },
    [wells, selectedWellboreIdsWithWellId]
  );

  const handleOpenDeleteModal = () => setIsDeleteWellModalOpen(true);
  const handleCloseDeleteModal = () => setIsDeleteWellModalOpen(false);

  const handleRemoveWell = () => {
    if (hoveredWell) {
      removeWell(hoveredWell.id);
      handleCloseDeleteModal();
    }
  };

  const handleHoverViewBtnClick = async (row: RowProps<Well>) => {
    const well = row.original;
    navigateToWellInspect({
      wellIds: [well.id],
      wellboreIds: map(well.wellbores, 'id'),
    });
  };

  const renderRowHoverComponent: React.FC<{
    row: RowProps<Well>;
  }> = ({ row }) => {
    const wellRow = row.original;
    return (
      <FlexRow>
        <ViewButton
          data-testid="button-view-document"
          onClick={() => handleHoverViewBtnClick(row)}
          hideIcon
        />
        <Dropdown
          openOnHover
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
        </Dropdown>
      </FlexRow>
    );
  };

  if (isLoading || !data) {
    return <EmptyState emptyTitle={t(LOADING_TEXT)} />;
  }

  if (data.length === 0) {
    return <EmptyState emptyTitle={t(FAVORITE_SET_NO_WELLS)} />;
  }

  return (
    <FavoriteWellWrapper>
      <Table<Well>
        id="favorite-wells-table"
        data={data}
        columns={columns}
        renderRowSubComponent={renderRowSubComponent}
        handleRowClick={handleRowClick}
        handleRowSelect={handleRowSelect}
        handleRowsSelect={handleRowsSelect}
        expandedIds={expandedIds}
        options={tableOptions}
        selectedIds={selectedWellIds}
        renderRowHoverComponent={renderRowHoverComponent}
      />
      <FavoriteWellsBulkActions
        allWellIds={wellIds}
        selectedWellIdsList={selectedWellIds}
        selectedWellboresList={selectedWellboreIdsWithWellId}
        deselectAll={() => handleRowsSelect(false)}
        favoriteId={favoriteId}
        favoriteWells={wells}
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
