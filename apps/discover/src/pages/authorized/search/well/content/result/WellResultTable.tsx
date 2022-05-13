import React, { useCallback, useEffect, useRef } from 'react';
import { batch, useDispatch } from 'react-redux';

import { processedWellsAdapter } from 'dataLayers/wells/wells/adapters';
import head from 'lodash/head';
import map from 'lodash/map';
import { useFavoriteWellIds } from 'services/favorites/hooks/useFavoriteWellIds';

import { Menu, Dropdown } from '@cognite/cogs.js';

import AddToFavoriteSetMenu from 'components/AddToFavoriteSetMenu';
import { ViewButton, MoreOptionsButton } from 'components/Buttons';
import { FavoriteStarIcon } from 'components/Icons/FavoriteStarIcon';
import { Table, RowProps } from 'components/Tablev3';
import { EMPTY_ARRAY } from 'constants/empty';
import { useDeepCallback, useDeepEffect, useDeepMemo } from 'hooks/useDeep';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { moveToCoords, zoomToCoords } from 'modules/map/actions';
import { useNavigateToWellInspect } from 'modules/wellInspect/hooks/useNavigateToWellInspect';
import { wellSearchActions } from 'modules/wellSearch/actions';
import { useWellSearchResultQuery } from 'modules/wellSearch/hooks/useWellSearchResultQuery';
import { useWells, useIndeterminateWells } from 'modules/wellSearch/selectors';
import { Well } from 'modules/wellSearch/types';
import { WellResultTableOptions } from 'pages/authorized/constant';
import { SearchBreadcrumb } from 'pages/authorized/search/common/searchResult';
import { ADD_TO_FAVORITES_OPTION_TEXT } from 'pages/authorized/search/document/constants';
import { SearchTableResultActionContainer } from 'pages/authorized/search/elements';
import { FlexRow } from 'styles/layout';

import { WellAppliedFilters } from '../../filters/WellAppliedFilters';
import { WellOptionPanel } from '../WellOptionPanel';

import { SearchResultsContainer, WellsContainer } from './elements';
import { useDataForTable } from './useDataForTable';
import { WellboreResultTable } from './WellBoreResultTable';
import { WellsBulkActions } from './WellsBulkActions';

const renderRowSubComponent = ({ row }: { row: { original: Well } }) => {
  return <WellboreResultTable well={row.original} />;
};

export const WellResultTable: React.FC = () => {
  const { data } = useWellSearchResultQuery();
  const { selectedWellIds, expandedWellIds } = useWells();
  const indeterminateWellIds = useIndeterminateWells();
  const favoriteWellIds = useFavoriteWellIds();
  const metrics = useGlobalMetrics('wells');
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();
  const dispatch = useDispatch();
  const navigateToWellInspect = useNavigateToWellInspect();
  const { columns } = useDataForTable();
  const { wells } = data || {};
  const wellsRef = useRef(wells);

  useEffect(() => {
    wellsRef.current = wells;
  }, [wells]);

  const wellsData = useDeepMemo(
    () => processedWellsAdapter(wells || EMPTY_ARRAY, userPreferredUnit),
    [wells, userPreferredUnit]
  );

  useDeepEffect(() => {
    const firstWell = head(wells);
    if (firstWell) {
      dispatch(wellSearchActions.toggleExpandedWell(firstWell, true));
    }
  }, [wells]);

  const handleDoubleClick = useCallback(
    (row: RowProps<Well> & { isSelected: boolean }) => {
      const well = row.original;
      if (well.geometry) {
        dispatch(zoomToCoords(well.geometry));
      }
    },
    []
  );

  const handleRowClick = useCallback(
    (row: RowProps<Well> & { isSelected: boolean }) => {
      const well = row.original;
      const point = well.geometry;
      batch(() => {
        dispatch(wellSearchActions.toggleExpandedWell(well));
        dispatch(moveToCoords(point));
      });
    },
    []
  );

  const handleRowSelect = useCallback(
    (row: RowProps<Well>, isSelected: boolean) => {
      const well = row.original;
      dispatch(wellSearchActions.toggleSelectedWells([well], { isSelected }));
    },
    []
  );

  const handleRowsSelect = useDeepCallback(
    (isSelected: boolean) => {
      if (wellsRef.current) {
        dispatch(
          wellSearchActions.toggleSelectedWells(wellsRef.current, {
            isSelected,
          })
        );
      }
    },
    [wellsRef.current]
  );

  const wellsStats = [
    {
      label: 'Wells',
      totalResults: data?.totalWells,
      currentHits: wellsData.wellsCount,
    },
    {
      label: 'Wellbores',
      totalResults: data?.totalWellbores,
      currentHits: wellsData.wellboresCount,
    },
  ];

  const renderRowOverlayComponent = useCallback(
    ({ row }) => {
      const isAlreadyInFavorite = favoriteWellIds
        ? Object.keys(favoriteWellIds).includes(String(row.original.id))
        : false;

      if (!isAlreadyInFavorite) return null;

      return <FavoriteStarIcon />;
    },
    [favoriteWellIds]
  );

  /**
   * When 'View' button on well head row is clicked
   */
  const handleViewClick = (well: Well) => {
    metrics.track('click-inspect-wellhead');
    navigateToWellInspect({
      wellIds: [well.id],
      wellboreIds: map(well.wellbores, 'id'),
    });
  };

  const renderRowHoverComponent: React.FC<{
    row: RowProps<Well>;
  }> = ({ row }) => {
    return (
      <FlexRow>
        <ViewButton
          data-testid="button-view-document"
          onClick={() => handleViewClick(row.original)}
          hideIcon
        />
        <Dropdown
          openOnHover
          content={
            <Menu>
              <Menu.Submenu
                content={
                  <AddToFavoriteSetMenu
                    wells={{
                      [row.original.id]: [],
                    }}
                  />
                }
              >
                <span>{ADD_TO_FAVORITES_OPTION_TEXT}</span>
              </Menu.Submenu>
            </Menu>
          }
        >
          <MoreOptionsButton data-testid="menu-button" />
        </Dropdown>
      </FlexRow>
    );
  };

  return (
    <WellsContainer>
      <SearchTableResultActionContainer>
        <SearchResultsContainer data-testid="well-search-result-container">
          <SearchBreadcrumb stats={wellsStats} />
          <WellAppliedFilters showClearTag showSearchPhraseTag showGeoFilters />
        </SearchResultsContainer>
        <WellOptionPanel />
      </SearchTableResultActionContainer>
      <Table<Well>
        scrollTable
        id="well-result-table"
        data={wellsData.processedWells}
        columns={columns}
        handleRowClick={handleRowClick}
        handleDoubleClick={handleDoubleClick}
        handleRowSelect={handleRowSelect}
        handleRowsSelect={handleRowsSelect}
        options={WellResultTableOptions}
        renderRowSubComponent={renderRowSubComponent}
        selectedIds={selectedWellIds}
        expandedIds={expandedWellIds}
        indeterminateIds={indeterminateWellIds}
        renderRowOverlayComponent={renderRowOverlayComponent}
        renderRowHoverComponent={renderRowHoverComponent}
      />
      <WellsBulkActions />
    </WellsContainer>
  );
};
