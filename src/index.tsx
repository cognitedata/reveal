import ReactDOM from 'react-dom';
import config from 'config/config';
import { Metrics } from '@cognite/metrics';
import { isDoNotTrackDomain } from 'utils/do-not-track';
import App from './App';

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
