// @ts-nocheck
import React from 'react';
import { Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { getContainer, styleScope } from 'utils/utils';
import ConfigProvider from 'antd/lib/config-provider';
import { useGlobalStyles } from '@cognite/cdf-utilities';
// import antdStyle from '@cognite/cogs.js/dist/antd.css'; // Uncomment to add antd
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

// This will override the appendTo prop on all Tooltips used from cogs
CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

export default function GlobalStyles(props: { children: React.ReactNode }) {
  useGlobalStyles([cogsStyles]);

  // useGlobalStyles([antdStyle, cogsStyles]); // uncomment to add antd
  return (
    <ConfigProvider getPopupContainer={getContainer}>
      <div className={styleScope}>{props.children}</div>
    </ConfigProvider>
  );
}
