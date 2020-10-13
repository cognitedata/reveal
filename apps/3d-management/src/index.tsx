import React from 'react';
import ReactDOM from 'react-dom';
// import * as Sentry from '@sentry/browser';
// import config from 'utils/config';
import './set-public-path';
import singleSpaReact from 'single-spa-react';

import { App } from './App';

// if (process.env.REACT_APP_SENTRY_DSN) {
//   Sentry.init({
//     dsn: process.env.REACT_APP_SENTRY_DSN,
//     // This is populated by the FAS build process. Change it if you want to
//     // source this information from somewhere else.
//     release: process.env.REACT_APP_RELEASE_ID,
//     // This is populated by react-scripts. However, this can be overridden by
//     // the app's build process if you wish.
//     environment: config.env,
//   });
// }

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  // @ts-ignore
  errorBoundary() {
    // eslint-disable-line
    // Customize the root error boundary for your microfrontend here.
    return <span>An error occurred in your app</span>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
