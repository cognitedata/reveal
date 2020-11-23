import React from 'react';
import { TENANT } from 'contants';
import AppProviders from './AppProviders';
import Authentication from './Authentication';

const AppRoot = (): JSX.Element => (
  <AppProviders tenant={TENANT}>
    <Authentication />
  </AppProviders>
);

export default AppRoot;
