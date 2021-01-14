import React from 'react';
import { Router } from 'react-router-dom';
import { createApiClient, createClient } from 'utils';
import { TenantProvider } from 'providers/TenantProvider';
import { I18nContainer } from '@cognite/react-i18n';
import { CdfClientProvider } from 'providers/CdfClientProvider';
import { ApiClientProvider } from 'providers/ApiClientProvider';
import GlobalStyles from 'global-styles';
import { Provider as ReduxProvider } from 'react-redux';
import store from 'store';
import { History } from 'history';

type Props = {
  children?: React.ReactNode;
  tenant: string;
  history: History;
};

const cdfClient = createClient();
const apiClient = createApiClient();

const AppProviders: React.FC<Props> = ({
  children,
  tenant,
  history,
}: Props): JSX.Element => {
  return (
    <ReduxProvider store={store}>
      <CdfClientProvider client={cdfClient}>
        <ApiClientProvider apiClient={apiClient}>
          <TenantProvider tenant={tenant}>
            <I18nContainer>
              <GlobalStyles />
              <Router history={history}>{children}</Router>
            </I18nContainer>
          </TenantProvider>
        </ApiClientProvider>
      </CdfClientProvider>
    </ReduxProvider>
  );
};

export default AppProviders;
