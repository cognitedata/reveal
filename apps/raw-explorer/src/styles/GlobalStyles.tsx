// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React from 'react';

import { createGlobalStyle } from 'styled-components';

import { styleScope } from '@raw-explorer/styles/styleScope';
import { getContainer } from '@raw-explorer/utils/utils';
import allotmentStyles from 'allotment/dist/style.css';
import ConfigProvider from 'antd/lib/config-provider';
import reactTableStyles from 'react-base-table/styles.css';

import { useGlobalStyles } from '@cognite/cdf-utilities';
import { Tooltip as CogsTooltip } from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs-without-fonts.css';

import antdTheme from './antd-theme.less';

// This will override the appendTo prop on all Tooltips used from cogs
CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

export default function GlobalStyles(props: { children: React.ReactNode }) {
  useGlobalStyles([cogsStyles, antdTheme, reactTableStyles, allotmentStyles]);

  return (
    <ConfigProvider getPopupContainer={getContainer}>
      <div className={styleScope}>
        <StyledGlobalStyles />
        {props.children}
      </div>
    </ConfigProvider>
  );
}

const StyledGlobalStyles = createGlobalStyle`
  .ant-modal-wrap {
    overflow-y: hidden !important; /* overrides antd style */
  }

  .rc-tabs-nav-operations {
    visibility: hidden;
    width: 0;
  }
`;
