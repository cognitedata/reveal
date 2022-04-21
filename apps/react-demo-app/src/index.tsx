import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/browser';
import { Metrics } from '@cognite/metrics';
import '@cognite/cogs.js/dist/cogs.css';
import config from 'utils/config';

import App from './App';
import * as serviceWorker from './serviceWorker';

if (process.env.REACT_APP_SENTRY_DSN) {
  // Instantiate Sentry project
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

if (process.env.REACT_APP_MIXPANEL_TOKEN) {
  // Instantiate Mixpanel project
  Metrics.init({
    mixpanelToken: process.env.REACT_APP_MIXPANEL_TOKEN || '',
    debug: process.env.REACT_APP_MIXPANEL_DEBUG === 'true',
    environment: config.env,
  });
}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// Unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
