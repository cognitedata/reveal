import React from 'react';

import AppProviders from 'components/AppProviders';
import AppAuth from 'components/AppAuth';
import sdk from 'services/CogniteSDK';
import { DataExplorationProvider } from '@cognite/data-exploration';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

const sanitizeTenant = (tenant: string = '') =>
  tenant.toLowerCase().replace(/[^a-z0-9-]/g, '');

const getTenantFromURL = () =>
  window.location.pathname.match(/^\/([^/]*)(.*)$/)?.[1];

const App = () => {
  const tenant = sanitizeTenant(getTenantFromURL());

  if (!tenant) {
    return (
      <div>
        If you see this screen and you are not a developer, please contact us!
        <button
          type="button"
          onClick={() => {
            window.location.href = 'https://localhost:3000/fusion';
          }}
        >
          Go to fusion tenant
        </button>
      </div>
    );
  }

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <DataExplorationProvider sdk={sdk}>
        <AppProviders
          tenant={tenant}
          initialState={{ environment: { tenant } }}
        >
          <AppAuth tenant={tenant} />
        </AppProviders>
      </DataExplorationProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default App;
