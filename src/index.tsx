import React from 'react';
import ReactDOM from 'react-dom';
// import * as Sentry from '@sentry/browser';
// import config from 'utils/config';
import './set-public-path';
import { configure } from 'react-hotkeys';
import singleSpaReact from 'single-spa-react';

import App from './App';

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
  // @ts-ignore no idea what's the type issue here but can't care less
  React,
  // @ts-ignore
  ReactDOM,
  rootComponent: App,
  // @ts-ignore
  errorBoundary() {
    // eslint-disable-line
    // Customize the root error boundary for your microfrontend here.
    return <span>An error occured in your app</span>;
  },
});
configure({
  // logLevel: 'debug',
  ignoreRepeatedEventsWhenKeyHeldDown: false,
  stopEventPropagationAfterIgnoring: false,
  stopEventPropagationAfterHandling: false,
  // todo: remove after https://github.com/greena13/react-hotkeys/issues/237
  ignoreEventsCondition: (keyEvent) => {
    const IGNORED_TAGS = ['input', 'select', 'textarea'];

    const eventIsFromIgnoredInput =
      keyEvent.target &&
      IGNORED_TAGS.includes(
        (keyEvent.target as HTMLElement).tagName.toLowerCase()
      );
    const eventIsFromEditableText =
      keyEvent.target && (keyEvent.target as HTMLElement).isContentEditable;
    if (eventIsFromIgnoredInput || eventIsFromEditableText) {
      return true;
    }
    return (
      keyEvent.key === ' ' || keyEvent.key === 'Enter' || keyEvent.key === 'Tab'
    );
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
