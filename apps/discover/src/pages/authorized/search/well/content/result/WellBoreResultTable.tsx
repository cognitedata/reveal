import { useFavoriteWellIds } from 'domain/favorites/internal/hooks/useFavoriteWellIds';
import { WellInternal } from 'domain/wells/well/internal/types';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Row } from 'react-table';

import isEmpty from 'lodash/isEmpty';
import sortBy from 'lodash/sortBy';

import { Dropdown, Menu } from '@cognite/cogs.js';

import AddToFavoriteSetMenu from 'components/AddToFavoriteSetMenu';
import { MoreOptionsButton, ViewButton } from 'components/Buttons';
import { FavoriteStarIcon } from 'components/Icons/FavoriteStarIcon';
import { Table, RowProps } from 'components/Tablev3';
import { useDeepMemo } from 'hooks/useDeep';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useTranslation } from 'hooks/useTranslation';
import { useVisibleWellboreColumns } from 'hooks/useVisibleWellboreColumns';
import { useNavigateToWellInspect } from 'modules/wellInspect/hooks/useNavigateToWellInspect';
import { wellSearchActions } from 'modules/wellSearch/actions';
import { useWellboresOfWellById } from 'modules/wellSearch/hooks/useWellsCacheQuerySelectors';
import { useWells } from 'modules/wellSearch/selectors';
import { isWellboreFavored } from 'modules/wellSearch/utils/isWellboreFavored';
import { WellboreSubtableOptions } from 'pages/authorized/constant';
import { ADD_TO_FAVORITES_OPTION_TEXT } from 'pages/authorized/search/document/constants';
import { FlexRow } from 'styles/layout';

import { NO_WELLBORES_FOUND } from '../constants';

import { OverlayCellPadding, WellBoreGroupCoumn, Message } from './elements';
import UnmatchingWellboreResultTable from './UnmatchingWellboreResultTable';

interface Props {
  well: WellInternal;
}

export const WellboreResultTable: React.FC<Props> = React.memo(({ well }) => {
  const { wellbores } = well;
  const { selectedWellboreIds } = useWells();
  const favoriteWellIds = useFavoriteWellIds();
  const navigateToWellInspect = useNavigateToWellInspect();
  const dispatch = useDispatch();
  const { t } = useTranslation('WellData');
  const metrics = useGlobalMetrics('wells');
  const visibleWellboreColumns = useVisibleWellboreColumns();
  const allWellbores = useWellboresOfWellById(well.id);

  const sortedWellbores = useDeepMemo(
    () => sortBy(wellbores, 'name'),
    [wellbores]
  );

  const handleRowSelect = useCallback(
    (row: RowProps<WellboreInternal>, isSelected: boolean) => {
      dispatch<any>(
        wellSearchActions.toggleSelectedWellboreOfWell({
          well: {
            ...well,
            wellbores: allWellbores,
          },
          wellboreId: row.original.id,
          isSelected,
        })
      );
    },
    [allWellbores]
  );

  /**
   * When 'View' button on well bore row is clicked
   */
  const handleViewClick = (wellbore: WellboreInternal) => {
    metrics.track('click-inspect-wellbore');
    navigateToWellInspect({ wellIds: [well.id], wellboreIds: [wellbore.id] });
  };

  const renderHoverRowSubComponent = ({
    row,
  }: {
    row: Row<WellboreInternal>;
  }) => {
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

  const renderRowOverlayComponent = ({
    row,
  }: {
    row: Row<WellboreInternal>;
  }) => {
    if (
      !isWellboreFavored(
        favoriteWellIds,
        String(well.id),
        String(row.original.id)
      )
    ) {
      return null;
    }

    return <FavoriteStarIcon />;
  };

  if (isEmpty(sortedWellbores)) {
    return <Message>{t(NO_WELLBORES_FOUND)}</Message>;
  }

  return (
    <WellBoreGroupCoumn>
      <Table<WellboreInternal>
        id="wellbore-result-table"
        indent
        data={sortedWellbores}
        columns={visibleWellboreColumns}
        handleRowSelect={handleRowSelect}
        options={WellboreSubtableOptions}
        selectedIds={selectedWellboreIds}
        renderRowOverlayComponent={renderRowOverlayComponent}
        renderRowHoverComponent={renderHoverRowSubComponent}
        hideHeaders
      />
      <UnmatchingWellboreResultTable
        well={well}
        matchingWellbores={sortedWellbores}
        visibleWellboreColumns={visibleWellboreColumns}
        allWellbores={allWellbores}
        renderHoverRowSubComponent={renderHoverRowSubComponent}
        renderRowOverlayComponent={renderRowOverlayComponent}
      />
    </WellBoreGroupCoumn>
  );
});
