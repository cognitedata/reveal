import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/browser';
import config from 'utils/config';
import { Metrics } from '@cognite/metrics';
import { getFASVersionName, getReleaseVersion } from 'utils/release';
import sidecar from 'utils/sidecar';

import AppRoot from './AppRoot/App';
import * as serviceWorker from './serviceWorker';

import '@cognite/cogs.js/dist/cogs.css';
import 'gridstack/dist/gridstack.min.css';
import 'gridstack/dist/h5/gridstack-dd-native';
import 'react-virtualized/styles.css';
import 'react-virtualized-tree/lib/main.css';

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    release: getReleaseVersion(),
    // This is populated by react-scripts. However, this can be overridden by
    // the app's build process if you wish.
    environment: config.env,
    ignoreErrors: ['Network request failed', 'Network Error'],
  });
}

const { mixpanel, applicationId } = sidecar;
if (mixpanel) {
  Metrics.init({
    mixpanelToken: mixpanel,
    debug: process.env.REACT_APP_MIXPANEL_DEBUG === 'true',
    environment: config.env,
    applicationId,
    versionName: getFASVersionName(),
    releaseId: getReleaseVersion(),
  });
}

// eslint-disable-next-line
ReactDOM.render(<AppRoot />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
