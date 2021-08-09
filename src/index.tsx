import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/browser';

import config from 'config/config';
import { Metrics } from '@cognite/metrics';

import App from 'components/App';
import { isDoNotTrackDomain } from 'utils/tracking';
import * as serviceWorker from './serviceWorker';

import '@cognite/cogs.js/dist/cogs.css';
import 'antd/dist/antd.css';
import 'react-datepicker/dist/react-datepicker.css';

require('dotenv').config();

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    // This is populated by the FAS build process. Change it if you want to
    // source this information from somewhere else.
    release: process.env.REACT_APP_RELEASE_ID,
    // This is populated by react-scripts. However, this can be overridden by
    // the app's build process if you wish.
    environment: config.environment,
  });
}

if (process.env.REACT_APP_MIXPANEL_TOKEN && !isDoNotTrackDomain()) {
  Metrics.init({
    mixpanelToken: process.env.REACT_APP_MIXPANEL_TOKEN,
    debug: process.env.REACT_APP_MIXPANEL_DEBUG === 'true',
    environment: config.environment,
  });
}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
