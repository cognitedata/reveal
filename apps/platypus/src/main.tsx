import React from 'react';
import ReactDOM from 'react-dom';
import './styles.css';
import App from './app/App';
import reportWebVitals from './reportWebVitals';
import * as Sentry from '@sentry/browser';
import config from './app/config/config';
import { environment } from './environments/environment';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: config.SENTRY_DSN,
    // This is populated by the FAS build process. Change it if you want to
    // source this information from somewhere else.
    release: config.APP_RELEASE_ID,
    // This is populated by react-scripts. However, this can be overridden by
    // the app's build process if you wish.
    environment: environment.APP_ENV,
    debug: true,
    ignoreErrors: ['ResizeObserver loop'],
  });
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
