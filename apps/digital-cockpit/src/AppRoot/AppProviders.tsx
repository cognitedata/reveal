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
import { HelpCenterContextProvider } from 'context/HelpCenterContext';

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
    {
      appId: 'digital-cockpit',
      dataSetName: 'digital-cockpit',
    },
    client
  );
  const apiClient = createApiClient(
    { appId: 'digital-cockpit', project: tenant },
    client
  );
  return (
    <ReduxProvider store={store}>
      <CdfClientProvider client={cdfClient}>
        <ApiClientProvider apiClient={apiClient}>
          <TenantProvider tenant={tenant}>
            <HelpCenterContextProvider>
              <GlobalStyles />
              <Router history={history}>{children}</Router>
            </HelpCenterContextProvider>
          </TenantProvider>
        </ApiClientProvider>
      </CdfClientProvider>
    </ReduxProvider>
  );
};

export default AppProviders;
