import ReactDOM from 'react-dom';
import '@cognite/cogs.js/dist/cogs.css';
import 'antd/dist/antd.css';
import 'react-datepicker/dist/react-datepicker.css';
import './i18n';
import 'services/metrics';

import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
