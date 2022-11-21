/* eslint-disable no-console */

/**
 * This is an entry file for the Charts in Fusion.
 * It needs to be separate from the Legacy Charts entry file because the render strategy differs a bit -
 * Fusion Charts uses Single SPA to emit a single index.js file to be injected into Fusion and can not
 * be directly rendered in DOM.
 *
 * This file is used in config-overrides.js file in fusionConfig as an entry point
 * for the app. If you want to change its name or move to another directory you need
 * to change the config.entry in the config-overrides as well.
 */

import ReactDOM from 'react-dom';
import React from 'react';
import singleSpaReact from 'single-spa-react';

import config from 'config/config';
import { isDevelopment, isPR } from './utils/environment';
import { RootAppFusion } from './AppFusion';

import './set-public-path';

console.log(
  `[Charts in Fusion] Cognite Charts running in ${config.environment}`
);

if (isDevelopment || isPR) {
  console.log('Config', config);
}

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: RootAppFusion,
  errorBoundary() {
    return <span>An error occurred in your app</span>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
