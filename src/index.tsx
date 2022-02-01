import ReactDOM from 'react-dom';
import config from 'config/config';
import { Metrics } from '@cognite/metrics';
import { configureI18n } from '@cognite/react-i18n';
import { shouldTrackMetrics } from 'services/metrics';
import App from './App';

import '@cognite/cogs.js/dist/cogs.css';
import 'antd/dist/antd.css';
import 'react-datepicker/dist/react-datepicker.css';

configureI18n({
  localStorageLanguageKey: 'chartsCurrentLanguage',
  lng: localStorage.getItem('chartsCurrentLanguage') || 'en',
  updateMissing: false,
  saveMissing: true,
});

if (shouldTrackMetrics) {
  Metrics.init({
    mixpanelToken: process.env.REACT_APP_MIXPANEL_TOKEN || '',
    debug: process.env.REACT_APP_MIXPANEL_DEBUG === 'true',
    environment: config.environment,
  });
}

ReactDOM.render(<App />, document.getElementById('root'));
