import * as React from 'react';
import { useDispatch } from 'react-redux';

import styled from 'styled-components/macro';

import { SegmentedControl, Tooltip } from '@cognite/cogs.js';

import { PlusButton } from 'components/Buttons';
import Header from 'components/Header/Header';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useTranslation } from 'hooks/useTranslation';
import {
  setFavoritesViewMode,
  showCreateFavoriteModal,
} from 'modules/favorite/reducer';
import { useViewMode } from 'modules/favorite/selectors';
import { ViewModeType } from 'modules/favorite/types';
import { MarginRightContainer } from 'styles/layout';

import {
  CREATE_SET_HEADER_BUTTON_TEXT,
  FAVORITE_CARD_SWITCH,
  FAVORITE_LIST_SWITCH,
} from '../constants';

import { Tabs } from './Tabs';

export const headerTitleText = 'Favorites & Saved Searches';
export const headerTitleDesc = 'Your saved Subsurface data & saved searches.';

const EmptyActions = styled.div`
  height: 36px;
`;

const SegmentedControlStyles = {
  height: '36px',
};

const ButtonStyles = {
  height: '28px',
  width: '28px',
  padding: '8px',
};

const RightButtonStyles = {
  ...ButtonStyles,
  marginLeft: '4px',
};
interface Props {
  hideActions?: boolean;
}
export const FavoriteHeader: React.FC<Props> = ({ hideActions }) => {
  const dispatch = useDispatch();
  const viewMode = useViewMode();
  const metrics = useGlobalMetrics('favorites');
  const { t } = useTranslation('Favorites');

  const dispatchOnCreateModalOpen = () => {
    metrics.track('click-open-create-modal-button');
    dispatch(showCreateFavoriteModal());
  };

  const handleSwitchView = (key: string) => {
    metrics.track(`click-${key.toLowerCase()}-view-button`);
    dispatch(setFavoritesViewMode(key as ViewModeType));
  };

  const renderRightContent = () => {
    if (hideActions) {
      return <EmptyActions />;
    }

    return (
      <>
        <MarginRightContainer>
          <PlusButton
            type="primary"
            text={t(CREATE_SET_HEADER_BUTTON_TEXT)}
            iconPlacement="right"
            tooltip={t('Create a new favorite set')}
            onClick={dispatchOnCreateModalOpen}
          />
        </MarginRightContainer>

        <Tooltip content={t('Switch between views')}>
          <SegmentedControl
            style={SegmentedControlStyles}
            currentKey={`${viewMode}`}
            onButtonClicked={handleSwitchView}
          >
            <SegmentedControl.Button
              style={ButtonStyles}
              key={ViewModeType.Card}
              icon="Grid"
              data-testid={FAVORITE_CARD_SWITCH}
              aria-label="Show grid view"
            />
            <SegmentedControl.Button
              style={RightButtonStyles}
              key={ViewModeType.Row}
              icon="List"
              data-testid={FAVORITE_LIST_SWITCH}
              aria-label="Show list view"
            />
          </SegmentedControl>
        </Tooltip>
      </>
    );
  };

  return (
    <Header
      title={t(headerTitleText)}
      description={t(headerTitleDesc)}
      Right={renderRightContent}
      Bottom={Tabs}
    />
  );
};
