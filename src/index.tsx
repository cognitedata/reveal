import React from 'react';
import ReactDOM from 'react-dom/client';
import './set-public-path';
import singleSpaReact from 'single-spa-react';

import App from './App';

const lifecycles = singleSpaReact({
  React,
  ReactDOM: ReactDOM as any,
  rootComponent: App,
  // @ts-ignore
  errorBoundary() {
    // eslint-disable-line
    // Customize the root error boundary for your microfrontend here.
    return <span>An error occured in your app</span>;
  },
  renderType: 'createRoot',
});

export const { bootstrap, mount, unmount } = lifecycles;
