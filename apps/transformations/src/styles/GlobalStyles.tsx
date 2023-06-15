import React from 'react';

import { TOOLTIP_DELAY_IN_MS } from '@transformations/common';
import { styleScope } from '@transformations/styles/styleScope';
import { getContainer } from '@transformations/utils';
import allotmentStyles from 'allotment/dist/style.css';
import { Modal, notification, ConfigProvider } from 'antd';
import reactTableStyles from 'react-base-table/styles.css';

import { useGlobalStyles, Timestamp } from '@cognite/cdf-utilities';
import {
  Loader,
  Tooltip as CogsTooltip,
  Modal as CogsModal,
} from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs-without-fonts.css';

import antdTheme from './antd-theme.less';

// This will override the appendTo prop on all Tooltips used from cog
CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
  delay: [TOOLTIP_DELAY_IN_MS, 0],
};

Modal.defaultProps = {
  ...Modal.defaultProps,
  getContainer,
};

CogsModal.defaultProps = {
  getContainer,
  ...CogsModal.defaultProps,
};

notification.config({
  getContainer,
});

Timestamp.defaultProps = {
  appendTo: getContainer,
};

export default function GlobalStyles(props: { children: React.ReactNode }) {
  const didLoadStyles = useGlobalStyles([
    cogsStyles,
    antdTheme,
    reactTableStyles,
    allotmentStyles,
  ]);

  if (!didLoadStyles) {
    return <Loader />;
  }

  return (
    <ConfigProvider getPopupContainer={getContainer}>
      <div className={styleScope}>{props.children}</div>
    </ConfigProvider>
  );
}
