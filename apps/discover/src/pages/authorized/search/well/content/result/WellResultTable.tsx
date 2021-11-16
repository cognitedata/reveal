import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { batch, connect, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import compact from 'lodash/compact';
import noop from 'lodash/noop';
import sortBy from 'lodash/sortBy';

import { Icon, Menu, Dropdown } from '@cognite/cogs.js';

import { getDateOrDefaultText } from '_helpers/date';
import { changeUnits } from '_helpers/units/utils';
import AddToFavoriteSetMenu from 'components/add-to-favorite-set-menu';
import { ViewButton, MoreOptionsButton } from 'components/buttons';
import { Options, Table, RowProps } from 'components/tablev3';
import navigation from 'constants/navigation';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { moveToCoords, zoomToCoords } from 'modules/map/actions';
import {
  wellSearchActions,
  setHoveredWellId,
} from 'modules/wellSearch/actions';
import { useFavoriteWellIds } from 'modules/wellSearch/hooks/useFavoriteWellIds';
import { useWells, useIndeterminateWells } from 'modules/wellSearch/selectors';
import { getGroupedWellboresByWellIds } from 'modules/wellSearch/service/asset/wellbore';
import { Well, InspectWellboreContext } from 'modules/wellSearch/types';
import { convertToFixedDecimal } from 'modules/wellSearch/utils';
import { WellResultTableOptions } from 'pages/authorized/constant';
import { SearchBreadcrumb } from 'pages/authorized/search/common/searchResult';
import { ADD_TO_FAVORITES_OPTION_TEXT } from 'pages/authorized/search/document/constants';
import {
  FavoriteIndicatorContainer,
  SearchTableResultActionContainer,
} from 'pages/authorized/search/elements';
import { generateWellColumns } from 'pages/authorized/search/well/utils';
import { FlexRow } from 'styles/layout';

import { WellOptionPanel } from '../WellOptionPanel';

import { WellsContainer } from './elements';
import { WellboreResultTable } from './WellBoreResultTable';
import { WellsBulkActions } from './WellsBulkActions';

const WellResult: React.FC<DispatchProps> = (props) => {
  const { selectedWellIds, expandedWellIds, selectedColumns, wells } =
    useWells();
  const indeterminateWellIds = useIndeterminateWells();
  const favoriteWellIds = useFavoriteWellIds();
  const history = useHistory();
  const metrics = useGlobalMetrics('wells');
  const {
    dispatchSetHoveredWellId,
    dispatchSetSelectedWell,
    dispatchToggleExpandedWell,
    dispatchToggleSelectedWells,
    dispatchUnsetHoveredWellId,
    dispatchGetAllWellbores,
    dispatchSetHoveredWellbores,
    dispatchSetWellbores,
    dispatchSetInspectContext,
    dispatchSetWellboresFetched,
  } = props;

  const userPreferredUnit = useUserPreferencesMeasurement();

  const dispatch = useDispatch();
  const [options] = useState<Options>(WellResultTableOptions);

  useEffect(() => {
    const wellboresFetchedWellIds = wells
      .filter((well) => well.wellbores)
      .map((well) => well.id);
    dispatchSetWellboresFetched(wellboresFetchedWellIds);
  }, [wells]);

  const columns = React.useMemo(
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

  const [accessorsToFixedDecimal] = useState(['waterDepth.value']);

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

  const data = useMemo(
    () =>
      wells.map((well) => {
        const item = convertToFixedDecimal(
          changeUnits(well, unitChangeAcceessors),
          accessorsToFixedDecimal
        );

        // format the date according to the default format
        if (item.spudDate) {
          item.spudDate = getDateOrDefaultText(item.spudDate);
        }
        return item;
      }),
    [wells, unitChangeAcceessors]
  );

  const handleDoubleClick = useCallback(
    (row: RowProps & { isSelected: boolean }) => {
      const well = row.original as Well;
      if (well.geometry) {
        dispatch(zoomToCoords(well.geometry));
      }
    },
    []
  );

  const handleRowClick = useCallback(
    (row: RowProps & { isSelected: boolean }) => {
      const well = row.original as Well;
      const point = well.geometry;
      batch(() => {
        dispatch(moveToCoords(point));
        dispatchToggleExpandedWell(well);
      });
    },
    []
  );

  /**
   * Select or deselect all wells
   */
  const handleRowsSelect = (value: boolean) => {
    batch(() => {
      dispatchToggleSelectedWells(value);
      if (value) {
        dispatchGetAllWellbores();
      }
    });
  };

  const renderRowSubComponent = useCallback(({ row }) => {
    return <WellboreResultTable well={row.original as Well} />;
  }, []);

  const wellsStats = {
    totalResults: (data || []).length, // This number is incorrect (need to get the total current result)
    currentHits: (data || []).length,
  };

  const renderRowOverlayComponent = useCallback(
    ({ row }) => {
      const isAlreadyInFavorite = favoriteWellIds.includes(
        String(row.original.id)
      );

      if (!isAlreadyInFavorite) return null;

      return (
        <FavoriteIndicatorContainer>
          <Icon type="FavoriteOn" />
        </FavoriteIndicatorContainer>
      );
    },
    [favoriteWellIds]
  );

  /**
   * When 'View' button on well head row is clicked
   */
  const onInspectWellheadClick = (row: RowProps) => {
    const currentWell = row.original as Well;
    metrics.track('click-inspect-wellhead');
    const isWellContainWellbores = wells.some(
      (well) => well.id === currentWell.id && well.wellbores
    );
    // If well head contain wellbores navigate to inspect if not fetch wellbores first and navigate to inspect
    if (!isWellContainWellbores) {
      getGroupedWellboresByWellIds([currentWell.id]).then((groupedData) => {
        batch(() => {
          dispatchSetWellbores(groupedData);
          dispatchSetHoveredWellbores(currentWell.id);
          dispatchSetInspectContext(InspectWellboreContext.HOVERED_WELLBORES);
        });
        history.push(navigation.SEARCH_WELLS_INSPECT);
      });
    } else {
      batch(() => {
        dispatchSetHoveredWellbores(currentWell.id);
        dispatchSetInspectContext(InspectWellboreContext.HOVERED_WELLBORES);
      });
      history.push(navigation.SEARCH_WELLS_INSPECT);
    }
  };

  const renderRowHoverComponent: React.FC<{
    row: RowProps;
  }> = ({ row }) => {
    return (
      <FlexRow>
        <ViewButton
          data-testid="button-view-document"
          onClick={() => onInspectWellheadClick(row)}
          hideIcon
        />
        <Dropdown
          openOnHover
          content={
            <Menu>
              <Menu.Submenu
                content={
                  <AddToFavoriteSetMenu
                    wellIds={[(row.original as Well).id]}
                    setFavored={noop}
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
        handleRowSelect={dispatchSetSelectedWell}
        handleRowsSelect={handleRowsSelect}
        handleMouseEnter={dispatchSetHoveredWellId}
        handleMouseLeave={dispatchUnsetHoveredWellId}
        options={options}
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

function dispatchToProps(dispatch: any) {
  return {
    dispatchToggleExpandedWell: (well: Well) =>
      dispatch(wellSearchActions.toggleExpandedWell(well)),
    dispatchSetSelectedWell: (row: RowProps<Well>, nextState: boolean) => {
      dispatch(wellSearchActions.setSelectedWell(row.original, nextState));
    },
    dispatchToggleSelectedWells: (value: boolean) =>
      dispatch(wellSearchActions.toggleSelectedWells(value)),
    dispatchSetHoveredWellId: (row: any) =>
      dispatch(setHoveredWellId(row.original)),
    dispatchUnsetHoveredWellId: () => dispatch(setHoveredWellId()),
    dispatchGetAllWellbores: () =>
      dispatch(wellSearchActions.getAllWellbores()),
    dispatchSetHoveredWellbores: (wellId: number) =>
      dispatch(wellSearchActions.setHoveredWellbores(wellId)),
    dispatchSetWellbores: (groupedData: any) =>
      dispatch(wellSearchActions.setWellbores(groupedData)),
    dispatchSetInspectContext: (context: InspectWellboreContext) =>
      dispatch(wellSearchActions.setWellboreInspectContext(context)),
    dispatchSetWellboresFetched: (wellIds: number[]) =>
      dispatch(wellSearchActions.setWellboresFetched(wellIds)),
  };
}
type DispatchProps = ReturnType<typeof dispatchToProps>;
export const WellResultTable = React.memo(
  connect(null, dispatchToProps)(WellResult)
);
