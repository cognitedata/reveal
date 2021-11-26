// @ts-nocheck
import React from 'react';
import { Tooltip as CogsTooltip, Drawer as CogsDrawer } from '@cognite/cogs.js';
import { getContainer } from 'utils/utils';
import ConfigProvider from 'antd/lib/config-provider';
import { useGlobalStyles } from '@cognite/cdf-utilities';
// import antdStyle from '@cognite/cogs.js/dist/antd.css'; // Uncomment to add antd
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import reactTableStyles from 'react-base-table/styles.css';
import { ids } from './cogsVariables';

// This will override the appendTo prop on all Tooltips used from cogs
CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

CogsDrawer.defaultProps = {
  ...CogsDrawer.defaultProps,
  getContainer,
};

export default function GlobalStyles(props: { children: React.ReactNode }) {
  useGlobalStyles([cogsStyles, reactTableStyles]);

  // useGlobalStyles([antdStyle, cogsStyles]); // uncomment to add antd
  return (
    <ConfigProvider getPopupContainer={getContainer}>
      <div className={ids.styleScope}>{props.children}</div>
    </ConfigProvider>
  );
}
