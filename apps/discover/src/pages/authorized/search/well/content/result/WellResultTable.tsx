import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { batch, useDispatch } from 'react-redux';

import head from 'lodash/head';
import map from 'lodash/map';
import { useFavoriteWellIds } from 'services/favorites/hooks/useFavoriteWellIds';
import { getDateOrDefaultText } from 'utils/date';
import { changeUnits } from 'utils/units';

import { Menu, Dropdown } from '@cognite/cogs.js';

import AddToFavoriteSetMenu from 'components/add-to-favorite-set-menu';
import { ViewButton, MoreOptionsButton } from 'components/buttons';
import { FavoriteStarIcon } from 'components/icons/FavoriteStarIcon';
import { Table, RowProps } from 'components/tablev3';
import { UserPreferredUnit } from 'constants/units';
import { useDeepCallback, useDeepEffect, useDeepMemo } from 'hooks/useDeep';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { moveToCoords, zoomToCoords } from 'modules/map/actions';
import { useNavigateToWellInspect } from 'modules/wellInspect/hooks/useNavigateToWellInspect';
import { wellSearchActions } from 'modules/wellSearch/actions';
import { useWellQueryResultWells } from 'modules/wellSearch/hooks/useWellQueryResultSelectors';
import { useWells, useIndeterminateWells } from 'modules/wellSearch/selectors';
import { Well } from 'modules/wellSearch/types';
import { convertToFixedDecimal } from 'modules/wellSearch/utils';
import { WellResultTableOptions } from 'pages/authorized/constant';
import { SearchBreadcrumb } from 'pages/authorized/search/common/searchResult';
import { ADD_TO_FAVORITES_OPTION_TEXT } from 'pages/authorized/search/document/constants';
import { SearchTableResultActionContainer } from 'pages/authorized/search/elements';
import { FlexRow } from 'styles/layout';

import { WellAppliedFilters } from '../../filters/WellAppliedFilters';
import { WellOptionPanel } from '../WellOptionPanel';

import { WellsContainer } from './elements';
import { useDataForTable } from './useDataForTable';
import { WellboreResultTable } from './WellBoreResultTable';
import { WellsBulkActions } from './WellsBulkActions';

export const WellResultTable: React.FC = () => {
  const wells = useWellQueryResultWells();
  const { selectedWellIds, expandedWellIds } = useWells();
  const indeterminateWellIds = useIndeterminateWells();
  const favoriteWellIds = useFavoriteWellIds();
  const metrics = useGlobalMetrics('wells');
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();
  const dispatch = useDispatch();
  const navigateToWellInspect = useNavigateToWellInspect();
  const { columns } = useDataForTable();
  const wellsRef = useRef(wells);

  useEffect(() => {
    wellsRef.current = wells;
  }, [wells]);

  const unitChangeAcceessors = useMemo(
    () => [
      {
        accessor: 'waterDepth.value',
        fromAccessor: 'waterDepth.unit',
        to: userPreferredUnit || UserPreferredUnit.FEET,
      },
    ],
    [userPreferredUnit]
  );

  const data = useDeepMemo(
    () =>
      wells.map((well) => {
        const item = convertToFixedDecimal(
          changeUnits(well, unitChangeAcceessors),
          ['waterDepth.value']
        );

        // format the date according to the default format
        if (item.spudDate) {
          item.spudDate = getDateOrDefaultText(item.spudDate);
        }
        return item;
      }),
    [wells, unitChangeAcceessors]
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
      batch(() => {
        dispatch(wellSearchActions.toggleSelectedWells([well], { isSelected }));
        dispatch(wellSearchActions.toggleExpandedWell(well));
      });
    },
    []
  );

  const handleRowsSelect = useDeepCallback(
    (isSelected: boolean) => {
      dispatch(
        wellSearchActions.toggleSelectedWells(wellsRef.current, { isSelected })
      );
    },
    [wellsRef.current]
  );

  const renderRowSubComponent = useCallback(({ row }) => {
    return <WellboreResultTable well={row.original as Well} />;
  }, []);

  const wellsStats = {
    totalResults: (data || []).length, // This number is incorrect (need to get the total current result)
    currentHits: (data || []).length,
  };

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
        <div>
          <SearchBreadcrumb stats={wellsStats} />
          <WellAppliedFilters showClearTag showSearchPhraseTag />
        </div>
        <WellOptionPanel />
      </SearchTableResultActionContainer>
      <Table<Well>
        scrollTable
        id="well-result-table"
        data={data}
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
