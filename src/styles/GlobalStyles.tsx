// @ts-nocheck
import React from 'react';
import { message } from 'antd';
import { Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { getContainer, styleScope } from 'utils/utils';
import ConfigProvider from 'antd/lib/config-provider';
import { useGlobalStyles } from '@cognite/cdf-utilities';
import antdStyle from 'antd/dist/antd.css';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

// This will override the appendTo prop on all Tooltips used from cogs
CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

message.config({ getContainer });

export default function GlobalStyles(props: { children: React.ReactNode }) {
  useGlobalStyles([antdStyle, cogsStyles]);

  return (
    <ConfigProvider getPopupContainer={getContainer}>
      <div className={styleScope}>{props.children}</div>
    </ConfigProvider>
  );
}
