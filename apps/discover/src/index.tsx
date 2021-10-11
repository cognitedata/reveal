import 'resize-observer-polyfill';

import { render } from 'react-dom';

import AppRoot from 'pages/App';

import './index.css';

render(<AppRoot />, document.getElementById('root'));

// import { renderApplication } from '@cognite/fe-base';
// renderApplication(AppRoot, AppRoutes);
// if (module.hot) {
//   module.hot.accept('./core/routes', () => {
//     // Accept hot modules only for ./routes subtree to avoid re-authentication
//     // on every save and speed up the development process #speed
//     // eslint-disable-next-line
//     const NextRoutes = require('./core/routes').default as typeof AppRoutes;
//     renderApplication(AppRoot, NextRoutes);
//   });
// }
