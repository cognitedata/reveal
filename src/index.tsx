/* eslint-disable no-console */

import ReactDOM from 'react-dom';
import React from 'react';

import config from 'config/config';
import { isDevelopment, isPR } from './utils/environment';

import { RootApp } from './App';

console.log(`Cognite Charts running in ${config.environment}`);

if (isDevelopment || isPR) {
  console.log('Config', config);
}

ReactDOM.render(<RootApp />, document.getElementById('root'));
