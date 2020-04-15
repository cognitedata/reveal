import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/browser';
import App from './App';
import * as serviceWorker from './serviceWorker';

import 'antd/dist/antd.css';
import '@cognite/cogs.js/dist/cogs.css';

if (process.env.REACT_APP_ENV !== 'development') {
  Sentry.init({
    dsn:
      'https://4558e4f6faaf4948ab9327457827a301@o124058.ingest.sentry.io/5193370',
  });
}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
