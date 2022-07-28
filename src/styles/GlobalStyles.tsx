import React from 'react';
import { styleScope } from 'utils/styleScope';
import { getContainer } from 'utils/utils';
import { useGlobalStyles } from '@cognite/cdf-utilities';
import { Icon, Loader } from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import {
  ConfigProvider,
  Modal,
  Tooltip,
  notification,
  Dropdown,
  Spin,
} from 'antd';

import antdTheme from './antd-theme.less';

Modal.defaultProps = {
  ...Modal.defaultProps,
  getContainer,
};

Tooltip.defaultProps = {
  ...Tooltip.defaultProps,
  getPopupContainer: getContainer,
};

notification.config({
  getContainer,
});

Dropdown.defaultProps = {
  ...Dropdown.defaultProps,
  getPopupContainer: getContainer,
};

Spin.setDefaultIndicator(<Icon type="Loader" />);

export function GlobalStyles(props: { children: React.ReactNode }) {
  const isInjectedStyles = useGlobalStyles([antdTheme, cogsStyles]);

  if (!isInjectedStyles) {
    return <Loader />;
  }

  return (
    <ConfigProvider getPopupContainer={getContainer}>
      <div className={styleScope}>{props.children}</div>
    </ConfigProvider>
  );
}
