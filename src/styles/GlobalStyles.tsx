// @ts-nocheck
import React from 'react';
import { Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { getContainer } from 'utils/utils';
import ConfigProvider from 'antd/lib/config-provider';
import { ids } from 'cogs-variables';
// import { useGlobalStyles } from '@cognite/cdf-utilities';
// import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

// This will override the appendTo prop on all Tooltips used from cogs
CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

export function GlobalStyles(props: { children: React.ReactNode }) {
  // useGlobalStyles([cogsStyles]);
  return (
    <ConfigProvider getPopupContainer={getContainer}>
      <div className={ids.styleScope}>{props.children}</div>
    </ConfigProvider>
  );
}
