import React from 'react';
// Here is where our custom render is being defined, so we don't need this check
import { render, RenderOptions } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createMockCdfClient, createMockApiClient } from 'utils/test/client';
import { CdfClientProvider } from 'providers/CdfClientProvider';
import { ApiClientProvider } from 'providers/ApiClientProvider';
import { TenantProvider } from 'providers/TenantProvider';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { StoreState } from 'store/types';
import { CdfClient } from 'utils/cdfClient';
import { ApiClient } from 'utils/apiClient';

import { createMockStore } from './store';

export default (
  ui: React.ReactNode,
  options?: Omit<RenderOptions, 'queries'> & {
    state: any; // StoreState;
    cdfClient?: CdfClient;
    apiClient?: ApiClient;
  }
) => {
  const store = createMockStore((options?.state || {}) as StoreState);
  const cdfClient = options?.cdfClient || createMockCdfClient();
  const apiClient = options?.apiClient || createMockApiClient();
  const queryClient = new QueryClient();
  const tenant = 'unit-test';

  type Props = {
    children: React.ReactNode;
  };
  const AppProviders: React.FC<Props> = ({ children }) => (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <CdfClientProvider client={cdfClient}>
          <ApiClientProvider apiClient={apiClient}>
            <TenantProvider tenant={tenant}>
              <BrowserRouter>
                <>{children}</>
              </BrowserRouter>
            </TenantProvider>
          </ApiClientProvider>
        </CdfClientProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );

  // This is where you can wrap your rendered UI component in redux stores,
  // providers, or anything else you might want.
  const component = <AppProviders>{ui}</AppProviders>;

  return render(component, options);
};
