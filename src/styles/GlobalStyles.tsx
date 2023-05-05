import { ReactNode } from 'react';
import { Tooltip as CogsTooltip } from '@cognite/cogs.js';
import ConfigProvider from 'antd/lib/config-provider';
import { useGlobalStyles } from '@cognite/cdf-utilities';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import consoleStyle from './global.css';

import { styleScope } from 'styles/styleScope';
import { getContainer } from 'utils/shared';

// This will override the appendTo prop on all Tooltips used from cogs
// @ts-ignore
CogsTooltip.defaultProps = {
  // @ts-ignore
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

export default function GlobalStyles(props: { children: ReactNode }) {
  useGlobalStyles([cogsStyles, consoleStyle]);

  return (
    <ConfigProvider getPopupContainer={getContainer}>
      <div className={styleScope}>{props.children}</div>
    </ConfigProvider>
  );
}
