import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';

import './app/utils/sentry';
import AppWrapper from './AppWrapper';
import { environment } from './environments/environment';

// Fusion UI will expect this lifecycle events to be exported
// When running app on local env as standalone app, we don't need it
const noop = () => '';
let lifecycles = {
  mount: noop,
  bootstrap: noop,
  unmount: noop,
} as any;

if (environment.APP_ENV === 'mock' || environment.APP_ENV === 'development') {
  ReactDOM.render(<AppWrapper />, document.getElementById('root'));
} else {
  lifecycles = singleSpaReact({
    React,
    ReactDOM,
    rootComponent: AppWrapper,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    errorBoundary() {
      // eslint-disable-line
      // Customize the root error boundary for your microfrontend here.
      return <span>An error occured in your app</span>;
    },
  });
}

export const { mount, bootstrap, unmount } = lifecycles;
