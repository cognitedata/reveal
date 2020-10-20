import React from 'react';
import { Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { getContainer, styleScope } from 'src/utils';
import ConfigProvider from 'antd/lib/config-provider';
import { useGlobalStyles } from '@cognite/cdf-utilities';
import antdStyle from '@cognite/cogs.js/dist/antd.css';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import localStyle from 'src/styles/global.css';
import message from 'antd/lib/message';

// This will override the appendTo prop on all Tooltips used from cogs
// @ts-ignore
CogsTooltip.defaultProps = {
  // @ts-ignore
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

export default function GlobalStyles(props: { children: React.ReactNode }) {
  useGlobalStyles([antdStyle, cogsStyles, localStyle]);
  message.config({ getContainer });

  return (
    <ConfigProvider getPopupContainer={getContainer}>
      <div className={styleScope}>{props.children}</div>
    </ConfigProvider>
  );
}
