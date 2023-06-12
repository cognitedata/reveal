/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ReactNode } from 'react';

import { styleScope } from '@data-catalog-app/styles/styleScope';
import { getContainer } from '@data-catalog-app/app/utils/shared';
import antdStyle from 'antd/dist/antd.css';
import ConfigProvider from 'antd/lib/config-provider';

import { useGlobalStyles } from '@cognite/cdf-utilities';
import { Tooltip as CogsTooltip } from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

import antdTheme from './antd-theme.less';
import consoleStyle from './global.css';

// This will override the appendTo prop on all Tooltips used from cogs
// @ts-ignore
CogsTooltip.defaultProps = {
  // @ts-ignore
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

export default function GlobalStyles(props: { children: ReactNode }) {
  useGlobalStyles([antdStyle, cogsStyles, antdTheme, consoleStyle]);

  return (
    <ConfigProvider getPopupContainer={getContainer}>
      <div className={styleScope}>{props.children}</div>
    </ConfigProvider>
  );
}
