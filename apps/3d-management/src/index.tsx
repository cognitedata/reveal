import React from 'react';
import ReactDOM from 'react-dom';
import './set-public-path';
import singleSpaReact from 'single-spa-react';

import { App } from './App';

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,

  // @ts-ignore
  errorBoundary() {
    // Customize the root error boundary for your microfrontend here.
    return <span>An error occurred in your app</span>;
  },

  // must be aligned with that id https://github.com/cognitedata/cdf-hub/pull/896/files#diff-bb6612be43d4f0ceceee1b286daf301a80e54aa1fc25edd5017a1aff986d6503R96
  domElementGetter: () => document.getElementById('cdf-3d-management')!,
});

export const { bootstrap, mount, unmount } = lifecycles;
