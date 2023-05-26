import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import config from '@platypus-app/config/config';
import { rootInjector } from '@platypus-app/di';
import { StoreType } from '@platypus-app/redux/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContainerProvider } from 'brandi-react';

import { I18nContainer } from '@cognite/react-i18n';
import { CogniteClient } from '@cognite/sdk';

import { setCogniteSDKClient } from '../../../src/environments/cogniteSdk';

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
          <I18nContainer>
            <BrowserRouter basename={`/${tenant}`}>{children}</BrowserRouter>
          </I18nContainer>
        </ContainerProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
};

export default AppProviders;
