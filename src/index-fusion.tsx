/* eslint-disable no-console */

import ReactDOM from 'react-dom';
import React from 'react';
import singleSpaReact from 'single-spa-react';

import config from 'config/config';
import { isDevelopment, isPR } from './utils/environment';
import { RootAppFusion } from './AppFusion';

import './set-public-path';

console.log(`Cognite Charts running in ${config.environment}`);

if (isDevelopment || isPR) {
  console.log('Config', config);
}

const lifecycles = singleSpaReact({
  React: React as any,
  ReactDOM,
  rootComponent: RootAppFusion,
  errorBoundary() {
    return <span>An error occurred in your app</span>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
