import * as React from 'react';
import ReactDOMClient from 'react-dom/client';
import './set-public-path';
import singleSpaReact from 'single-spa-react';

import App from './App';

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: App,
  // @ts-ignore
  errorBoundary() {
    // eslint-disable-line
    // Customize the root error boundary for your microfrontend here.
    return <span>An error occurred in your app</span>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
