/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';
import ReactDOM from 'react-dom';

import './set-public-path';
import singleSpaReact from 'single-spa-react';

import cdfApp from './cdfApp';

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: cdfApp,
  // @ts-ignore
  errorBoundary() {
    // eslint-disable-line
    // Customize the root error boundary for your microfrontend here.
    return <span>An error occured in your app.</span>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
