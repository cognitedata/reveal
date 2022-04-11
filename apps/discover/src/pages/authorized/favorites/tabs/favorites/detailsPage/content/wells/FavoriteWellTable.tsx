import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import omit from 'lodash/omit';
import { useFavoriteUpdateContent } from 'services/favorites/useFavoritesMutate';

import { Menu, Dropdown } from '@cognite/cogs.js';

import { MoreOptionsButton, ViewButton } from 'components/buttons';
import EmptyState from 'components/emptyState';
import { LOADING_TEXT } from 'components/emptyState/constants';
import { Options, Table, RowProps } from 'components/tablev3';
import { useDeepCallback, useDeepEffect } from 'hooks/useDeep';
import { FavoriteContentWells } from 'modules/favorite/types';
import { SelectedMap } from 'modules/inspectTabs/types';
import { useNavigateToWellInspect } from 'modules/wellInspect/hooks/useNavigateToWellInspect';
import { useWellsCacheQuery } from 'modules/wellSearch/hooks/useWellsCacheQuery';
import { Well, WellId, Wellbore } from 'modules/wellSearch/types';
import { WellResultTableOptions } from 'pages/authorized/constant';
import {
  FAVORITE_SET_NO_WELLS,
  REMOVE_FROM_SET_TEXT,
} from 'pages/authorized/favorites/constants';
import { DeleteWellFromSetModal } from 'pages/authorized/favorites/modals';
import { useDataForTable } from 'pages/authorized/search/well/content/result/useDataForTable';
import { FlexRow } from 'styles/layout';

import {
  filterWellboresFromWellsData,
  getIndeterminateWellIds,
  getSelectedWellIds,
  getUpdatedWellsAndWellboresAfterRemove,
  setSelectedWellboreIdsToWell,
} from '../../../utils';

import { FavoriteWellWrapper, RemoveFavoriteLabel } from './elements';
import { FavoriteWellboreTable } from './FavoriteWellBoreTable';
import { FavoriteWellsBulkActions } from './FavoriteWellsBulkActions';

export interface Props {
  wells: FavoriteContentWells | undefined;
  favoriteId: string;
}
export const FavoriteWellsTable: React.FC<Props> = ({ wells, favoriteId }) => {
  const { t } = useTranslation('Favorites');
  const navigateToWellInspect = useNavigateToWellInspect();
  const { mutateAsync: mutateFavoriteContent } = useFavoriteUpdateContent();

  const [wellIds, setWellIds] = useState<WellId[]>([]);
  const { data, isLoading } = useWellsCacheQuery(wellIds); // when we fetch the wells we also get the wellbores, no need to fetch for them again
  const [wellsData, setWellsData] = useState<Well[]>([]); // wells data with filtered wellbores
  const [tableOptions] = useState<Options>(WellResultTableOptions);
  const [expandedIds, setExpandedIds] = useState<SelectedMap>({});
  const [selectedWellIds, setSelectedWellIds] = useState<SelectedMap>({});
  const [indeterminateWellIds, setIndeterminateWellIds] = useState<SelectedMap>(
    {}
  );
  const [isDeleteWellModalOpen, setIsDeleteWellModalOpen] = useState(false);
  const [hoveredWell, setHoveredWell] = useState<Well>();

  const [selectedWellsAndWellboreIds, setSelectedWellsAndWellboreIds] =
    useState<FavoriteContentWells>({});

  useDeepEffect(() => setWellIds(wells ? Object.keys(wells) : []), [wells]);

  // filter out the wellbores that are not in the favorite wells list of added wellbores
  useDeepEffect(() => {
    if (data && wells) {
      setWellsData(filterWellboresFromWellsData(data, wells));
    }
  }, [data, wells]);

  const { columns } = useDataForTable();

  useDeepEffect(() => {
    setSelectedWellIds(
      getSelectedWellIds(wellsData, selectedWellsAndWellboreIds)
    );

    setIndeterminateWellIds(
      getIndeterminateWellIds(wellsData, selectedWellsAndWellboreIds)
    );
  }, [wellsData, selectedWellsAndWellboreIds]);

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

  const handleRowSelect = useCallback(
    (row: RowProps<Well>, nextState: boolean) => {
      setExpandedIds((state) => ({
        ...state,
        [row.original.id]: true,
      }));

      if (nextState) {
        setSelectedWellsAndWellboreIds((prevState) => ({
          ...prevState,
          [row.original.id]: row.original.wellbores?.map((wb) => wb.id),
        }));
      } else {
        setSelectedWellsAndWellboreIds((prevState) => ({
          ...prevState,
          [row.original.id]: [],
        }));
      }
    },
    []
  );

  const handleWellboreSelected = (wellId: string, wellboreId: string) => {
    setSelectedWellsAndWellboreIds((prevState) =>
      setSelectedWellboreIdsToWell(prevState, wellId, wellboreId)
    );
  };

  const handleRemoveWellbores = (well: Well, wellboreIds: string[]) => {
    const wellboreIdsForUpdate = (
      well.wellbores?.flatMap((wellbore) => wellbore.id) || []
    ).filter((wellboreId) => !wellboreIds.includes(wellboreId));

    if (isEmpty(wellboreIdsForUpdate)) {
      removeWell(well.id);
    } else {
      mutateFavoriteContent({
        id: favoriteId,
        updateData: {
          wells: { ...wells, [well.id]: wellboreIdsForUpdate },
        },
      }).then(() => {
        setSelectedWellsAndWellboreIds((prevState) => {
          return {
            ...prevState,
            [well.id]: prevState[well.id]?.filter(
              (wellboreId) => !wellboreIds.includes(wellboreId)
            ),
          };
        });
      });
    }
  };

  const handleRemoveSelectedWellsAndWellbores = () => {
    if (wells) {
      mutateFavoriteContent({
        id: favoriteId,
        updateData: {
          wells: getUpdatedWellsAndWellboresAfterRemove(
            wellsData,
            wells,
            selectedWellsAndWellboreIds
          ),
        },
      }).then(() => handleRowsSelect(false));
    }
  };

  const removeWell = (wellId: WellId) => {
    mutateFavoriteContent({
      id: favoriteId,
      updateData: {
        wells: wells ? omit(wells, [wellId]) : {},
      },
    }).then(() => {
      setSelectedWellsAndWellboreIds((prevState) => {
        return {
          ...prevState,
          [wellId]: [],
        };
      });
    });
  };

  const handleRowsSelect = useCallback(
    (checked: boolean) => {
      setSelectedWellsAndWellboreIds(
        wellsData.reduce((previousValue, currentValue) => {
          if (checked) {
            return {
              ...previousValue,
              [currentValue.id]: currentValue?.wellbores?.map(
                (wellbore) => wellbore.id
              ),
            };
          }
          return { ...previousValue, [currentValue.id]: [] };
        }, {})
      );
    },
    [wellsData]
  );

  const renderRowSubComponent = useDeepCallback(
    ({ row }) => {
      const wellbores: Wellbore[] =
        wellsData?.find((well) => well.id === row.original.id)?.wellbores || [];

      return (
        <FavoriteWellboreTable
          wellbores={wellbores}
          selectedWellboreIds={
            selectedWellsAndWellboreIds[row.original.id] || []
          }
          onRemoveWellbores={(wellboreIds) => {
            handleRemoveWellbores(row.original, wellboreIds);
          }}
          onViewWellbores={(wellboreIds) => {
            navigateToWellInspect({ wellIds: [row.original.id], wellboreIds });
          }}
          onSelectedWellbore={(wellboreId) =>
            handleWellboreSelected(row.original.id, wellboreId)
          }
        />
      );
    },
    [wellsData, selectedWellsAndWellboreIds]
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
        data={wellsData}
        columns={columns}
        renderRowSubComponent={renderRowSubComponent}
        handleRowClick={handleRowClick}
        handleRowSelect={handleRowSelect}
        handleRowsSelect={handleRowsSelect}
        expandedIds={expandedIds}
        options={tableOptions}
        selectedIds={selectedWellIds}
        indeterminateIds={indeterminateWellIds}
        renderRowHoverComponent={renderRowHoverComponent}
      />
      <FavoriteWellsBulkActions
        selectedWellsAndWellbores={selectedWellsAndWellboreIds}
        deselectAll={() => handleRowsSelect(false)}
        onViewWellbores={() => {
          navigateToWellInspect({
            wellIds: Object.keys(selectedWellsAndWellboreIds),
            wellboreIds: Object.values(selectedWellsAndWellboreIds).flat(),
          });
        }}
        onRemoveWellsAndWellbores={handleRemoveSelectedWellsAndWellbores}
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
