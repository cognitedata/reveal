import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Routes from 'components/Routes';
import TopBar from 'components/TopBar';
import PageLayout from 'components/Layout/PageLayout';
import { DataExplorationProvider } from '@cognite/data-exploration';
import { SDKProvider } from '@cognite/sdk-provider';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { CogniteClient } from '@cognite/sdk';
import { ToastContainer, Loader } from '@cognite/cogs.js';
import { getTenantFromURL } from 'utils/env';
import { useFirebase } from 'hooks/firebase';

const App = () => {
  const [authenicating, setAuth] = useState(true);
  const project = getTenantFromURL();

  const { isFetched: firebaseDone } = useFirebase(!authenicating);

  useEffect(() => {
    sdk.loginWithOAuth({
      project,
    });
    sdk.authenticate().then(() => setAuth(false));
  }, [project]);

  if (!project) {
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

  if (authenicating || firebaseDone) {
    return <Loader />;
  }

  console.log(Routes, TopBar);

  return (
    <BrowserRouter basename={`/${project}`}>
      <ToastContainer />
      <PageLayout>
        <main>
          <TopBar />
        </main>
      </PageLayout>
    </BrowserRouter>
  );
};

const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: 60000,
        staleTime: 60000,
      },
    },
  });
const sdk = new CogniteClient({
  appId: 'Cognite Charts',
});

export default function () {
  return (
    <QueryClientProvider client={queryClient}>
      <SDKProvider sdk={sdk}>
        <DataExplorationProvider sdk={sdk}>
          <App />
          <ReactQueryDevtools />
        </DataExplorationProvider>
      </SDKProvider>
    </QueryClientProvider>
  );
}
