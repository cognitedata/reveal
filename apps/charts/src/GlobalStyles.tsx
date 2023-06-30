/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import React from 'react';

import { ConfigProvider } from 'antd';
import antTheme from 'antd/dist/antd.css';
import katexCss from 'katex/dist/katex.min.css';

import { useGlobalStyles } from '@cognite/cdf-utilities';
import {
  Loader,
  Tooltip as CogsTooltip,
  Modal,
  DateRange,
} from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

import styleScope from './styleScope';

export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope.styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};
// This will override the appendTo prop on all Tooltips used from cog
CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

Modal.defaultProps = {
  ...Modal.defaultProps,
  getContainer,
};

DateRange.defaultProps = {
  ...DateRange.defaultProps,
  getContainer: () => {
    return getContainer();
  },
};

export default function GlobalStyles(props: { children: React.ReactNode }) {
  const isStyleLoaded = useGlobalStyles([cogsStyles, antTheme, katexCss]);

  if (!isStyleLoaded) {
    return <Loader />;
  }

  return (
    <ConfigProvider getPopupContainer={getContainer}>
      <div className={styleScope.styleScope}>{props.children}</div>
    </ConfigProvider>
  );
}
