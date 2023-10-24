/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React from 'react';

import { useGlobalStyles } from '@cognite/cdf-utilities';
import {
  Tooltip as CogsTooltip,
  Loader,
  Modal,
  Dropdown,
} from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

import styleScope from './styleScope';

export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope.styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};

// This will override the appendTo prop on all Tooltips used from cogs
// For tooltips to work on fusion this is needed.
CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

Modal.defaultProps = {
  ...Modal.defaultProps,
  getContainer,
};

Dropdown.defaultProps = {
  ...Dropdown.defaultProps,
  appendTo: getContainer,
};

export default function GlobalStyles(props: { children: React.ReactNode }) {
  const isStyleLoaded = useGlobalStyles([cogsStyles]);

  if (!isStyleLoaded) {
    return <Loader />;
  }

  return <div className={styleScope.styleScope}>{props.children}</div>;
}
