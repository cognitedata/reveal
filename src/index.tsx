import ReactDOM from 'react-dom';
import config from 'config/config';
import { Metrics } from '@cognite/metrics';
import { shouldTrackMetrics } from 'services/metrics';
import App from './App';

import '@cognite/cogs.js/dist/cogs.css';
import 'antd/dist/antd.css';
import 'react-datepicker/dist/react-datepicker.css';

require('dotenv').config();

if (shouldTrackMetrics) {
  Metrics.init({
    mixpanelToken: process.env.REACT_APP_MIXPANEL_TOKEN || '',
    debug: process.env.REACT_APP_MIXPANEL_DEBUG === 'true',
    environment: config.environment,
  });
}

ReactDOM.render(<App />, document.getElementById('root'));
