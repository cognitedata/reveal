import React from 'react';
import { TENANT } from 'constants/cdf';
import AppProviders from './AppProviders';
import Authentication from './Authentication';

const AppRoot = (): JSX.Element => (
  <AppProviders tenant={TENANT}>
    <Authentication />
  </AppProviders>
);

export default AppRoot;
