import React from 'react';

import ReactDOMClient from 'react-dom/client'; // import config from '@interactive-diagrams-app/utils/config';
import './set-public-path';
import singleSpaReact from 'single-spa-react';

import App from './App';

const lifecycles = singleSpaReact({
  // @ts-ignore
  React,
  ReactDOMClient,
  rootComponent: App,
  // @ts-ignore
  errorBoundary() {
    // eslint-disable-line
    // Customize the root error boundary for your microfrontend here.
    return <span>An error occured in your app</span>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
