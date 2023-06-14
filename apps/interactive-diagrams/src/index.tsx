import React from 'react';

import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';

import App from './App';
import { environment } from './environments/environment';

// Fusion UI will expect this lifecycle events to be exported
// when running app on local env as standalone app, we don't need it
const noop = () => '';
let lifecycles = {
  mount: noop,
  bootstrap: noop,
  unmount: noop,
} as any;

if (environment.APP_ENV === 'mock') {
  const container = document.getElementById('root');
  const root = ReactDOMClient.createRoot(container!);
  root.render(<App />);
} else {
  lifecycles = singleSpaReact({
    React,
    ReactDOMClient,
    rootComponent: App,
    errorBoundary() {
      // Customize the root error boundary for your micro-frontend here.
      return <span>An error occurred in your app</span>;
    },
  });
}

export const { mount, bootstrap, unmount } = lifecycles;
