import * as React from 'react';
import { message, notification } from 'antd';
import { Tooltip as CogsTooltip } from '@cognite/cogs.js';
import ConfigProvider from 'antd/lib/config-provider';
import { useGlobalStyles } from '@cognite/cdf-utilities';
import antdStyle from 'antd/dist/antd.css';
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

message.config({ getContainer });
notification.config({ getContainer });

export default function GlobalStyles(props: { children: React.ReactNode }) {
  useGlobalStyles([antdStyle, cogsStyles, consoleStyle]);

  return (
    <ConfigProvider getPopupContainer={getContainer}>
      <div className={styleScope}>{props.children}</div>
    </ConfigProvider>
  );
}
