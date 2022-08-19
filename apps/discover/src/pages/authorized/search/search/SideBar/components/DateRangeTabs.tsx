import * as React from 'react';

import { Tabs } from '@cognite/cogs.js';

import { DateTabType } from '../types';

import {
  LAST_CREATED_DATE_TAB_KEY,
  LAST_MODIFIED_DATE_TAB_KEY,
  LAST_CREATED_DATE_TAB_TEXT,
  LAST_MODIFIED_DATE_TAB_TEXT,
} from './constants';
import { DateRangeContainer } from './elements';

export const DateRangeTabs: React.FC<{
  activeKey: DateTabType;
  setActiveKey: (value: DateTabType) => void;
}> = (props) => {
  const { activeKey, setActiveKey } = props;

  return (
    <DateRangeContainer>
      <Tabs
        defaultActiveKey={LAST_CREATED_DATE_TAB_KEY}
        activeKey={activeKey}
        onChange={(key) => setActiveKey(key as DateTabType)}
      >
        <Tabs.TabPane
          key={LAST_CREATED_DATE_TAB_KEY}
          tab={LAST_CREATED_DATE_TAB_TEXT}
        />
        <Tabs.TabPane
          key={LAST_MODIFIED_DATE_TAB_KEY}
          tab={LAST_MODIFIED_DATE_TAB_TEXT}
        />
      </Tabs>
    </DateRangeContainer>
  );
};
