import ReactDOM from 'react-dom';
import config from 'config/config';
import { Metrics } from '@cognite/metrics';
import App from 'components/App';
import { isDoNotTrackDomain } from 'utils/tracking';
import * as serviceWorker from './serviceWorker';

import '@cognite/cogs.js/dist/cogs.css';
import 'antd/dist/antd.css';
import 'react-datepicker/dist/react-datepicker.css';

require('dotenv').config();

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
