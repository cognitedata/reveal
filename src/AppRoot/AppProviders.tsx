import React, { useContext } from 'react';
import { Router } from 'react-router-dom';
import { createApiClient, createClient } from 'utils';
import { TenantProvider } from 'providers/TenantProvider';
import { CdfClientProvider } from 'providers/CdfClientProvider';
import { ApiClientProvider } from 'providers/ApiClientProvider';
import GlobalStyles from 'global-styles';
import { Provider as ReduxProvider } from 'react-redux';
import store from 'store';
import { History } from 'history';
import { AuthProvider } from '@cognite/react-container';

type Props = {
  children?: React.ReactNode;
  tenant: string;
  history: History;
};

const AppProviders: React.FC<Props> = ({
  children,
  tenant,
  history,
}: Props): JSX.Element => {
  const { client } = useContext(AuthProvider);
  const cdfClient = createClient(
    { appId: 'digital-cockpit', dbName: '' },
    client
  );
  const apiClient = createApiClient(undefined, client);
  return (
    <ReduxProvider store={store}>
      <CdfClientProvider client={cdfClient}>
        <ApiClientProvider apiClient={apiClient}>
          <TenantProvider tenant={tenant}>
            <GlobalStyles />
            <Router history={history}>{children}</Router>
          </TenantProvider>
        </ApiClientProvider>
      </CdfClientProvider>
    </ReduxProvider>
  );
};

export default AppProviders;
