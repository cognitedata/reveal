import React from 'react';
import ReactDOM from 'react-dom';

import './set-public-path';
import singleSpaReact from 'single-spa-react';

import { AppWrapper } from './AppWrapper';

const lifecycles = singleSpaReact({
  React: React as any,
  ReactDOM,
  rootComponent: AppWrapper,
  // @ts-ignore
  errorBoundary() {
    // eslint-disable-line
    // Customize the root error boundary for your microfrontend here.
    return <span>An error occurred in your app</span>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
