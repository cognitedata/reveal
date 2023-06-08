// @ts-nocheck
import React from 'react';
import { getContainer } from '@access-management/utils/utils';
import { styleScope } from './styleScope';
import { Icon, Loader, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useGlobalStyles } from '@cognite/cdf-utilities';
import { createGlobalStyle } from 'styled-components';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import {
  ConfigProvider,
  Modal,
  Tooltip,
  notification,
  Dropdown,
  Spin,
} from 'antd';
import antdReset from 'antd/es/style/reset.css';

const antdStyles = [antdReset];

// This will override the appendTo prop on all Tooltips used from cogs
Modal.defaultProps = {
  ...Modal.defaultProps,
  getContainer,
};

Tooltip.defaultProps = {
  ...Tooltip.defaultProps,
  getContainer,
};

CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

notification.config({
  getContainer,
});

Dropdown.defaultProp = {
  ...Dropdown.defaultProps,
  getPopupContainer: getContainer,
};

Spin.setDefaultIndicator(<Icon type="Loader" />);

export default function GlobalStyles(props: { children: React.ReactNode }) {
  const isInjectedStyles = useGlobalStyles([...antdStyles, cogsStyles]);

  if (!isInjectedStyles) {
    return <Loader />;
  }

  return (
    <ConfigProvider getPopupContainer={getContainer}>
      <StyledGlobalStyles />
      <div className={styleScope}>{props.children}</div>
    </ConfigProvider>
  );
}

const StyledGlobalStyles = createGlobalStyle`
  .ant-modal-wrap {
    overflow-y: hidden !important;
  }

  .rc-tabs-nav-operations {
    visibility: hidden;
    width: 0;
  }
`;
