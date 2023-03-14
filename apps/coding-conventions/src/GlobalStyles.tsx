/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React from 'react';
import {
  Tooltip as CogsTooltip,
  Loader,
  Modal,
  Dropdown,
  Drawer,
  Select,
} from '@cognite/cogs.js';
import { useGlobalStyles } from '@cognite/cdf-utilities';

import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import monacoStyles from 'monaco-editor/dev/vs/editor/editor.main.css';

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

Select.defaultProps = {
  ...Select.defaultProps,
  menuPortalTarget: getContainer(),
};

Drawer.defaultProps = {
  ...Drawer.defaultProps,
  getContainer,
};

export default function GlobalStyles(props: { children: React.ReactNode }) {
  const isStyleLoaded = useGlobalStyles([cogsStyles, monacoStyles]);

  if (!isStyleLoaded) {
    return <Loader />;
  }

  return <div className={styleScope.styleScope}>{props.children}</div>;
}
