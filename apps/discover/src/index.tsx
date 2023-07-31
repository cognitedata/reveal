import 'resize-observer-polyfill';

import ReactDOM from 'react-dom/client';

import AppRoot from 'pages/App';

import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<AppRoot />);
