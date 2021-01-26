import React from 'react';
import ReactDOM from 'react-dom';

import { configureI18n } from '@cognite/react-i18n';

import App from './App';
import '@cognite/cogs.js/dist/cogs.css';

configureI18n({
  useSuspense: true,
}).then(() => {
  ReactDOM.render(<App />, document.getElementById('root'));
});
