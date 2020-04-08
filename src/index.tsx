import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as Sentry from '@sentry/browser';
import App from './App';
import * as serviceWorker from './serviceWorker';

import '@cognite/cogs.js/dist/cogs.css';

if (process.env.REACT_APP_ENV !== 'development') {
  Sentry.init({
    dsn: 'https://da67b4b23d3e4baea6c36de155a08491@sentry.io/3541732',
  });
}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
