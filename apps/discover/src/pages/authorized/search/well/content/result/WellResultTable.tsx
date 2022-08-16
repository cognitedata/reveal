import { useFavoriteWellIds } from 'domain/favorites/internal/hooks/useFavoriteWellIds';
import { useTrajectoriesQuery } from 'domain/wells/trajectory/internal/queries/useTrajectoriesQuery';
import { useWellSearchResultQuery } from 'domain/wells/well/internal/queries/useWellSearchResultQuery';
import { processWellsData } from 'domain/wells/well/internal/transformers/processWellsData';
import { WellInternal } from 'domain/wells/well/internal/types';
import { getWellboreIdsList } from 'domain/wells/wellbore/internal/transformers/getWellboreIdsList';

import React, { useCallback, useEffect, useRef } from 'react';
import { batch, useDispatch } from 'react-redux';

import head from 'lodash/head';
import map from 'lodash/map';

import { Menu, Dropdown } from '@cognite/cogs.js';

import AddToFavoriteSetMenu from 'components/AddToFavoriteSetMenu';
import { ViewButton, MoreOptionsButton } from 'components/Buttons';
import { FavoriteStarIcon } from 'components/Icons/FavoriteStarIcon';
import { Table, RowProps } from 'components/Tablev3';
import { EMPTY_ARRAY } from 'constants/empty';
import { useDeepCallback, useDeepEffect, useDeepMemo } from 'hooks/useDeep';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { moveToCoords, zoomToCoords } from 'modules/map/actions';
import { useNavigateToWellInspect } from 'modules/wellInspect/hooks/useNavigateToWellInspect';
import { wellSearchActions } from 'modules/wellSearch/actions';
import { useWells, useIndeterminateWells } from 'modules/wellSearch/selectors';
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

const renderRowSubComponent = ({
  row,
}: {
  row: { original: WellInternal };
}) => {
  return <WellboreResultTable well={row.original} />;
};

export const WellResultTable: React.FC = () => {
  const { data } = useWellSearchResultQuery();
  const { selectedWellIds, expandedWellIds } = useWells();
  const indeterminateWellIds = useIndeterminateWells();
  const favoriteWellIds = useFavoriteWellIds();
  const metrics = useGlobalMetrics('wells');
  const dispatch = useDispatch();
  const navigateToWellInspect = useNavigateToWellInspect();
  const { wells } = data || {};
  const wellsRef = useRef(wells);

  const wellboreIds = getWellboreIdsList(wells);
  const { isLoading, data: trajectories } = useTrajectoriesQuery({
    wellboreIds,
  });

  const doglegSeverityUnit = head(trajectories)?.maxDoglegSeverity.unit;
  const { columns } = useDataForTable(doglegSeverityUnit);

  useEffect(() => {
    wellsRef.current = wells;
  }, [wells]);

  const wellsData = useDeepMemo(
    () => processWellsData(wells || EMPTY_ARRAY, trajectories),
    [wells, isLoading]
  );

  useDeepEffect(() => {
    const firstWell = head(wells);
    if (firstWell) {
      dispatch<any>(wellSearchActions.toggleExpandedWell(firstWell, true));
    }
  }, [wells]);

  const handleDoubleClick = useCallback(
    (row: RowProps<WellInternal> & { isSelected: boolean }) => {
      const well = row.original;
      if (well.geometry) {
        dispatch(zoomToCoords(well.geometry));
      }
    },
    []
  );

  const handleRowClick = useCallback(
    (row: RowProps<WellInternal> & { isSelected: boolean }) => {
      const well = row.original;
      const point = well.geometry;
      batch(() => {
        dispatch<any>(wellSearchActions.toggleExpandedWell(well));
        dispatch(moveToCoords(point));
      });
    },
    []
  );

  const handleRowSelect = useCallback(
    (row: RowProps<WellInternal>, isSelected: boolean) => {
      const well = row.original;
      dispatch<any>(
        wellSearchActions.toggleSelectedWells([well], { isSelected })
      );
    },
    []
  );

  const handleRowsSelect = useDeepCallback(
    (isSelected: boolean) => {
      if (wellsRef.current) {
        dispatch<any>(
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
    ({ row }: any) => {
      const isAlreadyInFavorite = favoriteWellIds
        ? Object.keys(favoriteWellIds).includes(String(row.original.id))
        : false;

      if (!isAlreadyInFavorite) {
        return null;
      }

      return <FavoriteStarIcon />;
    },
    [favoriteWellIds]
  );

  /**
   * When 'View' button on well head row is clicked
   */
  const handleViewClick = (well: WellInternal) => {
    metrics.track('click-inspect-wellhead');
    navigateToWellInspect({
      wellIds: [well.id],
      wellboreIds: map(well.wellbores, 'id'),
    });
  };

  const renderRowHoverComponent: React.FC<{
    row: RowProps<WellInternal>;
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
      <Table<WellInternal>
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
