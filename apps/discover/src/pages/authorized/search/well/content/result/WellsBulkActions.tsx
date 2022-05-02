import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { openInNewTab } from 'utils/openInNewTab';

import { Dropdown } from '@cognite/cogs.js';

import AddToFavoriteSetMenu from 'components/AddToFavoriteSetMenu';
import { NO_ITEMS_ADDED_TEXT } from 'components/AddToFavoriteSetMenu/constants';
import { ViewButton, FavoriteButton, CloseButton } from 'components/Buttons';
import TableBulkActions from 'components/TableBulkActions';
import { showErrorMessage } from 'components/Toast';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useNavigateToWellInspect } from 'modules/wellInspect/hooks/useNavigateToWellInspect';
import { wellSearchActions } from 'modules/wellSearch/actions';
import { useWellQueryResultWells } from 'modules/wellSearch/hooks/useWellQueryResultSelectors';
import {
  useSelectedWellIds,
  useSelectedWellboreIds,
  useExternalLinkFromSelectedWells,
} from 'modules/wellSearch/selectors';

import { useSelectedWellsForFavorites } from '../../../../../../modules/wellSearch/selectors';
import {
  ADD_SELECTED_WELLS_TEXT,
  CLEAR_SELECTION_TEXT,
  OPEN_BROWSER_MESSAGE,
  OPEN_FIELD_PRODUCTION_MESSAGE,
  VIEW_SELECTED_WELL_TEXT,
} from '../constants';

export const WellsBulkActions: React.FC = () => {
  const { t } = useTranslation('Search');
  const dispatch = useDispatch();
  const metrics = useGlobalMetrics('wells');

  const wells = useWellQueryResultWells();
  const selectedWellIds = useSelectedWellIds();
  const selectedWellboreIds = useSelectedWellboreIds();
  const selectedWells = useSelectedWellsForFavorites();
  const externalLinks = useExternalLinkFromSelectedWells();
  const navigateToWellInspect = useNavigateToWellInspect();

  const selectedWellsCount = selectedWellIds.length;
  const selectedWellboresCount = selectedWellboreIds.length;

  const handleClickFavoriteButton = () => {
    if (!selectedWellsCount) {
      showErrorMessage(t(NO_ITEMS_ADDED_TEXT));
    }
  };

  const handleDeselectAll = () => {
    dispatch(
      wellSearchActions.toggleSelectedWells(wells, {
        isSelected: false,
        clear: true,
      })
    );
  };

  const handleClickView = () => {
    metrics.track('click-inspect-checked-wellbores');
    navigateToWellInspect({
      wellIds: selectedWellIds,
      wellboreIds: selectedWellboreIds,
    });
  };

  const title = `${selectedWellsCount} ${
    selectedWellsCount > 1 ? 'wells' : 'well'
  } selected`;

  const subtitle = `With ${selectedWellboresCount} ${
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
        content={<AddToFavoriteSetMenu wells={selectedWells} />}
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
        data-testid="wells-bulk-action-close"
      />
    </TableBulkActions>
  );
};
