/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React from 'react';

import { Tooltip as CogsTooltip, Modal, Dropdown } from '@cognite/cogs.js';

import 'monaco-editor/dev/vs/editor/editor.main.css';
import '@react-awesome-query-builder/ui/css/styles.css';

// copilot styles
import 'highlight.js/styles/dracula.css';
import 'react-resizable/css/styles.css';

// import styleScope from './styleScope';
const styleScope = 'flexible-data-explorer-style-scope';

export const getContainer = () => document.body;

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
  return (
    <div className={styleScope} style={{ height: '100%' }}>
      {props.children}
    </div>
  );
}
