import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { batch, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Row } from 'react-table';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import noop from 'lodash/noop';
import sortBy from 'lodash/sortBy';
import styled from 'styled-components/macro';

import { Dropdown, Menu } from '@cognite/cogs.js';

import AddToFavoriteSetMenu from 'components/add-to-favorite-set-menu';
import { MoreOptionsButton, ViewButton } from 'components/buttons';
import { FavoriteStarIcon } from 'components/icons/FavoriteStarIcon';
import { Table, RowProps } from 'components/tablev3';
import navigation from 'constants/navigation';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { wellSearchActions } from 'modules/wellSearch/actions';
import { useFavoriteWellIds } from 'modules/wellSearch/hooks/useFavoriteWellIds';
import { useWells, useWellbores } from 'modules/wellSearch/selectors';
import {
  Wellbore,
  Well,
  InspectWellboreContext,
} from 'modules/wellSearch/types';
import {
  WellboreColumns,
  WellboreSubtableOptions,
} from 'pages/authorized/constant';
import { ADD_TO_FAVORITES_OPTION_TEXT } from 'pages/authorized/search/document/constants';
import { FlexRow } from 'styles/layout';

import { NO_WELLBORES_FOUND } from '../constants';

import { OverlayCellPadding } from './elements';
import { LoadingWellbores } from './LoadingWellbores';

interface Props {
  well: Well;
}

const TABLE_ROW_HEIGHT = 50;

export const Message = styled.div`
  line-height: ${TABLE_ROW_HEIGHT}px;
  padding: 0 12px;
`;

const WellboreResult: React.FC<Props> = ({ well }) => {
  const { isLoading, wellbores } = useWellbores([well.id]);

  const { selectedWellboreIds, selectedWellIds } = useWells();
  const favoriteWellIds = useFavoriteWellIds();

  const dispatch = useDispatch();
  const { t } = useTranslation('WellData');
  const history = useHistory();
  const metrics = useGlobalMetrics('wells');

  const [columns] = useState(WellboreColumns);

  const getSortedWellbores = (wellboreList: Wellbore[] | undefined) =>
    wellboreList ? sortBy(wellboreList, 'name') : [];

  const data = React.useMemo(() => getSortedWellbores(wellbores), [wellbores]);

  const handleRowSelect = useCallback(
    (row: RowProps<Wellbore>, value: boolean) => {
      dispatch(
        wellSearchActions.setSelectedWellboresWithWell(
          { [row.original.id]: value },
          well.id
        )
      );
    },
    []
  );

  const handleRowsSelect = useCallback(
    (value: boolean) => {
      batch(() => {
        dispatch(
          wellSearchActions.setSelectedWellboresWithWell(
            getWellboreIds(value),
            well.id
          )
        );
        // Select well selected on wellbore selection
        dispatch(wellSearchActions.setSelectedWell(well, value));
      });
    },
    [wellbores]
  );

  const getWellboreIds = (isSelected: boolean) => {
    const ids: { [key: string]: boolean } = {};
    if (wellbores) {
      wellbores.forEach((wellbore) => {
        ids[wellbore.id] = isSelected;
      });
    }
    return ids;
  };

  useEffect(() => {
    if (
      !isLoading &&
      wellbores.length &&
      !checkAnyWellboreSelected &&
      selectedWellIds[well.id]
    ) {
      handleRowsSelect(true);
    }
  }, [isLoading, wellbores]);

  // This checks any wellbore is currently selected or previously selected.
  const checkAnyWellboreSelected = useMemo(
    () => data.some((wb) => !isUndefined(selectedWellboreIds[wb.id])),
    [data, selectedWellboreIds]
  );

  if (isLoading) {
    return <LoadingWellbores />;
  }

  if (data.length === 0) {
    return <Message>{t(NO_WELLBORES_FOUND)}</Message>;
  }

  /**
   * When 'View' button on well bore row is clicked
   */
  const handleViewClick = (row: Row) => {
    const wellboreId = (row.original as Wellbore).id;
    metrics.track('click-inspect-wellbore');
    batch(() => {
      /**
       * wellbore is already fetched when row is extracted so we have directly navigate to inspect view
       */
      dispatch(
        wellSearchActions.setWellboreInspectContext(
          InspectWellboreContext.HOVERED_WELLBORES
        )
      );
      dispatch(wellSearchActions.setHoveredWellbores(well.id, wellboreId));
    });
    history.push(navigation.SEARCH_WELLS_INSPECT);
  };

  const renderHoverRowSubComponent = ({ row }: { row: Row }) => {
    return (
      <FlexRow>
        <OverlayCellPadding>
          <FlexRow>
            <ViewButton
              data-testid="button-view-wellbore"
              onClick={() => handleViewClick(row)}
              hideIcon
            />
            <Dropdown
              openOnHover
              content={
                <Menu>
                  <Menu.Submenu
                    content={
                      <AddToFavoriteSetMenu
                        wellboreIds={[(row.original as Wellbore).id]}
                        wellIds={[well.id]}
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
        </OverlayCellPadding>
      </FlexRow>
    );
  };

  const renderRowOverlayComponent = ({ row }: { row: Row<Wellbore> }) => {
    // undefined favorite set or well id not in favorite
    if (
      isUndefined(favoriteWellIds) ||
      !Object.keys(favoriteWellIds).includes(String(well.id))
    )
      return null;

    // wellbore list not empty and wellbore row not in welbore list
    if (
      !isEmpty(favoriteWellIds[well.id]) &&
      !favoriteWellIds[well.id].includes(row.original.id)
    )
      return null;

    return <FavoriteStarIcon />;
  };
  return (
    <Table<Wellbore>
      id="wellbore-result-table"
      indent
      data={data}
      columns={columns}
      handleRowSelect={handleRowSelect}
      handleRowsSelect={handleRowsSelect}
      options={WellboreSubtableOptions}
      selectedIds={selectedWellboreIds}
      renderRowOverlayComponent={renderRowOverlayComponent}
      renderRowHoverComponent={renderHoverRowSubComponent}
      hideHeaders
    />
  );
};

export const WellboreResultTable = React.memo(WellboreResult);
