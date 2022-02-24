import ReactDOM from 'react-dom';
import config from 'config/config';
import { Metrics } from '@cognite/metrics';
import { shouldTrackMetrics } from 'services/metrics';
import '@cognite/cogs.js/dist/cogs.css';
import 'antd/dist/antd.css';
import 'react-datepicker/dist/react-datepicker.css';
import './i18n';

import App from './App';

if (shouldTrackMetrics) {
  Metrics.init({
    mixpanelToken: process.env.REACT_APP_MIXPANEL_TOKEN || '',
    debug: process.env.REACT_APP_MIXPANEL_DEBUG === 'true',
    environment: config.environment,
  });
}

ReactDOM.render(<App />, document.getElementById('root'));
