import './set-public-path';
import React from 'react';

import * as Sentry from '@sentry/browser';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';

import { getEnvironment } from '@data-exploration-app/utils/environment';

import App from './app/App';
import { environment } from './environment';

if (environment.SENTRY_DSN && getEnvironment() === 'production') {
  Sentry.init({
    dsn: environment.SENTRY_DSN,
    // This is populated by the FAS build process. Change it if you want to
    // source this information from somewhere else
    release: environment.APP_RELEASE_ID,
    // This is populated by react-scripts. However, this can be overridden by
    // the app's build process if you wish
    environment: getEnvironment(),
  });
}

export const { bootstrap, mount, unmount } = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: App,
});
