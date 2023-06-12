// @ts-nocheck
import React from 'react';
import { Tooltip, Modal } from '@cognite/cogs.js';
import {
  getContainer,
  styleScope,
} from 'apps/cdf-document-search/src/utils/utils';
import ConfigProvider from 'antd/lib/config-provider';
import { useGlobalStyles } from '@cognite/cdf-utilities';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

// This will override the appendTo prop on all Tooltips used from cogs
Tooltip.defaultProps = {
  ...Tooltip.defaultProps,
  appendTo: getContainer,
};
// This will override the appendTo prop on all Modal used from cogs
Modal.defaultProps = {
  ...Modal.defaultProps,
  getContainer: getContainer,
};

export default function GlobalStyles(props: { children: React.ReactNode }) {
  useGlobalStyles([cogsStyles]);

  return (
    <ConfigProvider getPopupContainer={getContainer}>
      <div className={styleScope}>{props.children}</div>
    </ConfigProvider>
  );
}
