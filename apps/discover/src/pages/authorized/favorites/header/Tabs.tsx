import * as React from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import styled from 'styled-components/macro';

import { Tabs as CogsTabs } from '@cognite/cogs.js';

import navigation from 'constants/navigation';

import {
  FAVORITES_TAB_KEY,
  FAVORITES_TAB_TEXT,
  SAVED_SEARCHES_TAB_KEY,
  SAVED_SEARCHES_TAB_TEXT,
} from '../constants';

const TabResetMargins = styled.div`
  & > .MuiTabs-root {
    margin-top: 10px;
    margin-bottom: 0px;

    & > .MuiTabs-scroller {
      margin-bottom: 0px;
    }
  }
`;

export const Tabs: React.FC = () => {
  const { pathname } = useLocation();
  const history = useHistory();

  const activeTab = pathname.includes(navigation.FAVORITES_SAVED_SEARCH)
    ? SAVED_SEARCHES_TAB_KEY
    : FAVORITES_TAB_KEY;

  const handleNavigation = (key: string) => {
    if (key === SAVED_SEARCHES_TAB_KEY) {
      history.push(navigation.FAVORITES_SAVED_SEARCH);
    } else {
      history.push(navigation.FAVORITES);
    }
  };

  return (
    <TabResetMargins>
      <CogsTabs activeKey={activeTab} onChange={handleNavigation}>
        <CogsTabs.TabPane key={FAVORITES_TAB_KEY} tab={FAVORITES_TAB_TEXT} />
        <CogsTabs.TabPane
          key={SAVED_SEARCHES_TAB_KEY}
          tab={SAVED_SEARCHES_TAB_TEXT}
        />
      </CogsTabs>
    </TabResetMargins>
  );
};
