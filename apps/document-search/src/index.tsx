import React from 'react';
import ReactDOM from 'react-dom';

import * as Sentry from '@sentry/browser';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';

import './set-public-path';

import App from './App';
import config from './utils/config';

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    // This is populated by the FAS build process. Change it if you want to
    // source this information from somewhere else.
    release: process.env.REACT_APP_RELEASE_ID,
    // This is populated by react-scripts. However, this can be overridden by
    // the app's build process if you wish.
    environment: config.env,
  });
}

export const { bootstrap, mount, unmount } = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: App,
});
