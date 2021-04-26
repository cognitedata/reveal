import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Routes from 'components/Routes';
import { SDKProvider } from '@cognite/sdk-provider';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { CogniteClient } from '@cognite/sdk';
import { ToastContainer, Loader } from '@cognite/cogs.js';
import { getTenantFromURL } from 'utils/env';
import { useFirebaseInit } from 'hooks/firebase';

const App = () => {
  const [authenicating, setAuth] = useState(true);
  const project = getTenantFromURL();

  const { isFetched: firebaseDone, isError } = useFirebaseInit(!authenicating);

  useEffect(() => {
    sdk.loginWithOAuth({
      project,
    });
    sdk.authenticate().then((a) => setAuth(!a));
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

  if (authenicating || !firebaseDone) {
    return <Loader />;
  }

  if (isError) {
    return <>nope</>;
  }

  return (
    <BrowserRouter basename={`/${project}`}>
      <ToastContainer />
      <Routes />
    </BrowserRouter>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      cacheTime: 60000,
      staleTime: 60000,
    },
  },
});

const sdk = new CogniteClient({
  appId: 'Cognite Charts',
});

export default function RootApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <SDKProvider sdk={sdk}>
        <App />
        <ReactQueryDevtools />
      </SDKProvider>
    </QueryClientProvider>
  );
}
