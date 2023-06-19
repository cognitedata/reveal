import React from 'react';
import ReactDOMClient from 'react-dom/client';
import App from './App';

import singleSpaReact from 'single-spa-react';
import './set-public-path';

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: App,
  errorBoundary() {
    // eslint-disable-line
    // Customize the root error boundary for your microfrontend here.
    return <span>An error occured in your app</span>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
