import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Dropdown } from '@cognite/cogs.js';

import { openInNewTab } from '_helpers/openInNewTab';
import AddToFavoriteSetMenu from 'components/add-to-favorite-set-menu';
import { NO_ITEMS_ADDED_TEXT } from 'components/add-to-favorite-set-menu/constants';
import { ViewButton, FavoriteButton, CloseButton } from 'components/buttons';
import TableBulkActions from 'components/table-bulk-actions';
import { showErrorMessage } from 'components/toast';
import navigation from 'constants/navigation';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { wellSearchActions } from 'modules/wellSearch/actions';
import {
  useSelectedWellIds,
  useSelectedWellboreIds,
  useExternalLinkFromSelectedWells,
  useWellboresFetching,
} from 'modules/wellSearch/selectors';
import { InspectWellboreContext } from 'modules/wellSearch/types';

import {
  ADD_SELECTED_WELLS_TEXT,
  CLEAR_SELECTION_TEXT,
  FETCHING_SELECTED_WELBORE_MESSAGE,
  OPEN_BROWSER_MESSAGE,
  OPEN_FIELD_PRODUCTION_MESSAGE,
  VIEW_SELECTED_WELL_TEXT,
} from '../constants';

export const WellsBulkActions: React.FC = () => {
  const { t } = useTranslation('Search');
  const history = useHistory();
  const dispatch = useDispatch();
  const metrics = useGlobalMetrics('wells');

  const selectedWellIds = useSelectedWellIds();
  const selectedWellboreIds = useSelectedWellboreIds();
  const externalLinks = useExternalLinkFromSelectedWells();
  const wellboresFetching = useWellboresFetching();

  const selectedWellsCount = useMemo(
    () => selectedWellIds.length,
    [selectedWellIds]
  );
  const selectedWellboresCount = useMemo(
    () => selectedWellboreIds.length,
    [selectedWellboreIds]
  );

  const handleClickFavoriteButton = () => {
    if (!selectedWellsCount) {
      showErrorMessage(t(NO_ITEMS_ADDED_TEXT));
    }
  };

  const handleDeselectAll = () => {
    dispatch(wellSearchActions.toggleSelectedWells(false));
  };

  const handleClickView = () => {
    metrics.track('click-inspect-checked-wellbores');
    dispatch(
      wellSearchActions.setWellboreInspectContext(
        InspectWellboreContext.CHECKED_WELLBORES
      )
    );
    history.push(navigation.SEARCH_WELLS_INSPECT);
  };

  const title = `${selectedWellsCount} ${
    selectedWellsCount > 1 ? 'wells' : 'well'
  } selected`;

  const subtitle = wellboresFetching
    ? FETCHING_SELECTED_WELBORE_MESSAGE
    : `With ${selectedWellboresCount} ${
        selectedWellboresCount > 1 ? 'wellbores' : 'wellbore'
      } inside`;

  return (
    <TableBulkActions
      isVisible={!!selectedWellsCount}
      title={title}
      subtitle={subtitle}
    >
      {externalLinks.length ? (
        <ViewButton
          variant="inverted"
          size="default"
          text={t(OPEN_FIELD_PRODUCTION_MESSAGE)}
          tooltip={t(OPEN_BROWSER_MESSAGE)}
          onClick={(event) => openInNewTab(event, externalLinks)}
          aria-label={OPEN_BROWSER_MESSAGE}
          hideIcon
        />
      ) : null}

      <ViewButton
        variant="inverted"
        size="default"
        tooltip={t(VIEW_SELECTED_WELL_TEXT)}
        onClick={handleClickView}
        data-testid="wells-inspect-button"
        hideIcon
      />

      <TableBulkActions.Separator />

      <Dropdown
        placement="top"
        content={
          <AddToFavoriteSetMenu
            wellIds={selectedWellIds}
            wellboreIds={selectedWellboreIds}
          />
        }
      >
        <FavoriteButton
          tooltip={t(ADD_SELECTED_WELLS_TEXT)}
          onClick={handleClickFavoriteButton}
          data-testid="welldata-favorite-all-button"
          aria-label={ADD_SELECTED_WELLS_TEXT}
        />
      </Dropdown>

      <TableBulkActions.Separator />

      <CloseButton
        variant="inverted"
        tooltip={t(CLEAR_SELECTION_TEXT)}
        onClick={handleDeselectAll}
        aria-label={CLEAR_SELECTION_TEXT}
      />
    </TableBulkActions>
  );
};
