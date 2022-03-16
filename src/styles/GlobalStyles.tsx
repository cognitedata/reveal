// @ts-nocheck
import React from 'react';
import { Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { getContainer } from 'utils/utils';
import ConfigProvider from 'antd/lib/config-provider';
import { useGlobalStyles } from '@cognite/cdf-utilities';
// import antdStyle from '@cognite/cogs.js/dist/antd.css'; // Uncomment to add antd
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import reactTableStyles from 'react-base-table/styles.css';
import { createGlobalStyle } from 'styled-components';
import { styleScope } from 'styles/styleScope';

// This will override the appendTo prop on all Tooltips used from cogs
CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

export default function GlobalStyles(props: { children: React.ReactNode }) {
  useGlobalStyles([cogsStyles, reactTableStyles]);

  // useGlobalStyles([antdStyle, cogsStyles]); // uncomment to add antd
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
