import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import styled from 'styled-components/macro';

import { SegmentedControl, Tooltip } from '@cognite/cogs.js';

import { PlusButton } from 'components/buttons';
import Header from 'components/header/Header';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import {
  setViewMode,
  showCreateFavoriteSetModal,
} from 'modules/favorite/actions';
import { ViewMode } from 'modules/favorite/constants';
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
  const metrics = useGlobalMetrics('favorites');
  const { t } = useTranslation('Favorites');

  const dispatchSetViewMode = (viewMode: ViewModeType) =>
    dispatch(setViewMode(viewMode));

  const dispatchOnCreateModalOpen = () => {
    metrics.track('click-open-create-modal-button');
    dispatch(showCreateFavoriteSetModal());
  };

  const handleSwitchView = (key: ViewModeType) => {
    metrics.track(`click-${key.toLowerCase()}-view-button`);
    return dispatchSetViewMode(key);
  };

  const viewMode = useViewMode();

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
            onButtonClicked={(key: string) =>
              handleSwitchView(key as ViewModeType)
            }
          >
            <SegmentedControl.Button
              style={ButtonStyles}
              key={ViewMode.Card}
              icon="Grid"
              data-testid={FAVORITE_CARD_SWITCH}
              aria-label="Show grid view"
            />
            <SegmentedControl.Button
              style={RightButtonStyles}
              key={ViewMode.Row}
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
