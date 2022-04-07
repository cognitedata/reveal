import 'resize-observer-polyfill';

import { render } from 'react-dom';

import AppRoot from 'pages/App';

import './index.css';

render(<AppRoot />, document.getElementById('root'));
