import React from 'react';
import ReactDOM from 'react-dom';

import './set-public-path';
import singleSpaReact from 'single-spa-react';

import App from './App';

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  errorBoundary() {
    // eslint-disable-line
    // Customize the root error boundary for your microfrontend here.
    return <span>An error occured in your app</span>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
