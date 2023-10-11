import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserHistoryProvider } from '@user-history';
import { ContainerProvider } from 'brandi-react';

import { CogniteClient } from '@cognite/sdk';

import { setCogniteSDKClient } from '../../environments/cogniteSdk';
import config from '../config/config';
import { rootInjector } from '../di';
import { StoreType } from '../redux/store';

export type Props = {
  store: StoreType;
  children: React.ReactNode;
  tenant: string;
};

const AppProviders = ({ store, children, tenant }: Props) => {
  const queryClient = new QueryClient();
  const cogniteClient: CogniteClient = new CogniteClient({
    appId: config.APP_APP_ID,
    baseUrl: window.location.origin,
    project: 'mock',
    noAuthMode: true,
    getToken: async () => 'mock',
  });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  cogniteClient.initAPIs();

  setCogniteSDKClient(cogniteClient!);

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ContainerProvider container={rootInjector}>
          <UserHistoryProvider
            cluster="test-cluster"
            project="test-project"
            userId="test-user"
          >
            <BrowserRouter basename={`/${tenant}`}>{children}</BrowserRouter>
          </UserHistoryProvider>
        </ContainerProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
};

export default AppProviders;
