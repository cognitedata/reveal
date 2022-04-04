import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Row } from 'react-table';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import sortBy from 'lodash/sortBy';
import { useFavoriteWellIds } from 'services/favorites/hooks/useFavoriteWellIds';
import styled from 'styled-components/macro';

import { Dropdown, Menu } from '@cognite/cogs.js';

import AddToFavoriteSetMenu from 'components/add-to-favorite-set-menu';
import { MoreOptionsButton, ViewButton } from 'components/buttons';
import { FavoriteStarIcon } from 'components/icons/FavoriteStarIcon';
import { Table, RowProps } from 'components/tablev3';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useNavigateToWellInspect } from 'modules/wellInspect/hooks/useNavigateToWellInspect';
import { wellSearchActions } from 'modules/wellSearch/actions';
import { useWellQueryResultWellbores } from 'modules/wellSearch/hooks/useWellQueryResultSelectors';
import { useWells } from 'modules/wellSearch/selectors';
import { Wellbore, Well } from 'modules/wellSearch/types';
import {
  WellboreColumns,
  WellboreSubtableOptions,
} from 'pages/authorized/constant';
import { ADD_TO_FAVORITES_OPTION_TEXT } from 'pages/authorized/search/document/constants';
import { FlexRow } from 'styles/layout';

import { NO_WELLBORES_FOUND } from '../constants';

import { OverlayCellPadding } from './elements';

interface Props {
  well: Well;
}

const TABLE_ROW_HEIGHT = 50;

export const Message = styled.div`
  line-height: ${TABLE_ROW_HEIGHT}px;
  padding: 0 12px;
`;

export const WellboreResultTable: React.FC<Props> = React.memo(({ well }) => {
  const wellbores = useWellQueryResultWellbores([well.id]);
  const { selectedWellboreIds } = useWells();
  const favoriteWellIds = useFavoriteWellIds();
  const navigateToWellInspect = useNavigateToWellInspect();
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();
  const dispatch = useDispatch();
  const { t } = useTranslation('WellData');
  const metrics = useGlobalMetrics('wells');
  const columns = WellboreColumns(userPreferredUnit);

  const sortedWellbores = useMemo(
    () => sortBy(wellbores, 'name'),
    [JSON.stringify(wellbores)]
  );

  const handleRowSelect = useCallback(
    (row: RowProps<Wellbore>, isSelected: boolean) => {
      dispatch(
        wellSearchActions.toggleSelectedWellboreOfWell({
          well,
          wellboreId: row.original.id,
          isSelected,
        })
      );
    },
    []
  );

  /**
   * When 'View' button on well bore row is clicked
   */
  const handleViewClick = (wellbore: Wellbore) => {
    metrics.track('click-inspect-wellbore');
    navigateToWellInspect({ wellIds: [well.id], wellboreIds: [wellbore.id] });
  };

  const renderHoverRowSubComponent = ({ row }: { row: Row<Wellbore> }) => {
    return (
      <FlexRow>
        <OverlayCellPadding>
          <FlexRow>
            <ViewButton
              data-testid="button-view-wellbore"
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
                        wells={{ [well.id]: [row.original.id] }}
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
      !favoriteWellIds[well.id].includes(String(row.original.id))
    )
      return null;

    return <FavoriteStarIcon />;
  };

  if (sortedWellbores.length === 0) {
    return <Message>{t(NO_WELLBORES_FOUND)}</Message>;
  }

  return (
    <Table<Wellbore>
      id="wellbore-result-table"
      indent
      data={sortedWellbores}
      columns={columns}
      handleRowSelect={handleRowSelect}
      options={WellboreSubtableOptions}
      selectedIds={selectedWellboreIds}
      renderRowOverlayComponent={renderRowOverlayComponent}
      renderRowHoverComponent={renderHoverRowSubComponent}
      hideHeaders
    />
  );
});
