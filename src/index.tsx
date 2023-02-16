import * as React from 'react';
import ReactDOM from 'react-dom';
// import './set-public-path';
import singleSpaReact from 'single-spa-react';

import App from './App';

// Fusion UI will expect this lifecycle events to be exported
// when running app on local env as standalone app, we don't need it
const noop = () => '';
let lifecycles = {
  mount: noop,
  bootstrap: noop,
  unmount: noop,
} as any;
console.log(
  'Running mock',
  process.env.REACT_APP_IS_MOCK,
  process.env.NODE_ENV
);
if (process.env.REACT_APP_IS_MOCK as any) {
  const container = document.getElementById('root');
  console.log(container);
  ReactDOM.render(<App />, container);
} else {
  lifecycles = singleSpaReact({
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
}

export const { bootstrap, mount, unmount } = lifecycles;
