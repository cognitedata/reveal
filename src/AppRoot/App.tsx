import React from 'react';
import AppProviders from './AppProviders';
import { TENANT } from '../constants';
import Authentication from './Authentication';

const AppRoot = (): JSX.Element => (
  <AppProviders tenant={TENANT}>
    <Authentication />
  </AppProviders>
);

export default AppRoot;
