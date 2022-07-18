import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/browser';
import config from 'configs/config';

import '@cognite/cogs.js/dist/cogs.css';

import App from './App';
import * as serviceWorker from './serviceWorker';

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

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
