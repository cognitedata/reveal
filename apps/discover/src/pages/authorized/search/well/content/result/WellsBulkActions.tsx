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
    ? 'Fetching selected wellbores...'
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
          text={t('Open field production data')}
          tooltip={t('Open data in new browser tabs')}
          onClick={(event) => openInNewTab(event, externalLinks)}
          aria-label="Open data in new browser tabs"
          hideIcon
        />
      ) : null}

      <ViewButton
        variant="inverted"
        size="default"
        tooltip={t('View the selected wells')}
        onClick={handleClickView}
        data-testid="wells-inspect-button"
        hideIcon
      />

      <TableBulkActions.Separator />

      <Dropdown
        placement="top"
        content={<AddToFavoriteSetMenu wellIds={selectedWellIds} />}
      >
        <FavoriteButton
          tooltip={t('Add the selected wells to favorites')}
          onClick={handleClickFavoriteButton}
          data-testid="welldata-favorite-all-button"
          aria-label="Add the selected wells"
        />
      </Dropdown>

      <TableBulkActions.Separator />

      <CloseButton
        variant="inverted"
        tooltip={t('Clear selection')}
        onClick={handleDeselectAll}
        aria-label="Clear selection"
      />
    </TableBulkActions>
  );
};
