import React, { useCallback, useMemo } from 'react';
import { batch, useDispatch } from 'react-redux';

import compact from 'lodash/compact';
import head from 'lodash/head';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import { getDateOrDefaultText } from 'utils/date';
import { changeUnits } from 'utils/units';

import { Menu, Dropdown } from '@cognite/cogs.js';

import AddToFavoriteSetMenu from 'components/add-to-favorite-set-menu';
import { ViewButton, MoreOptionsButton } from 'components/buttons';
import { FavoriteStarIcon } from 'components/icons/FavoriteStarIcon';
import { Table, RowProps } from 'components/tablev3';
import { useDeepCallback, useDeepEffect, useDeepMemo } from 'hooks/useDeep';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useFavoriteWellIds } from 'modules/api/favorites/hooks/useFavoriteWellIds';
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
import { generateWellColumns } from 'pages/authorized/search/well/utils';
import { FlexRow } from 'styles/layout';

import { WellOptionPanel } from '../WellOptionPanel';

import { WellsContainer } from './elements';
import { WellboreResultTable } from './WellBoreResultTable';
import { WellsBulkActions } from './WellsBulkActions';

export const WellResultTable: React.FC = () => {
  const wells = useWellQueryResultWells();

  const { selectedWellIds, expandedWellIds, selectedColumns } = useWells();

  const indeterminateWellIds = useIndeterminateWells();
  const favoriteWellIds = useFavoriteWellIds();
  const metrics = useGlobalMetrics('wells');
  const userPreferredUnit = useUserPreferencesMeasurement();
  const dispatch = useDispatch();
  const navigateToWellInspect = useNavigateToWellInspect();

  const columns = useDeepMemo(
    () =>
      sortBy(
        compact(
          selectedColumns.map(
            (column) => generateWellColumns(userPreferredUnit)[column]
          )
        ),
        'order'
      ),
    [selectedColumns, userPreferredUnit]
  );

  const unitChangeAcceessors = useMemo(
    () => [
      {
        accessor: 'waterDepth.value',
        fromAccessor: 'waterDepth.unit',
        to: userPreferredUnit,
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
      dispatch(wellSearchActions.toggleSelectedWells(wells, { isSelected }));
    },
    [wells]
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
        <SearchBreadcrumb stats={wellsStats} />
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
