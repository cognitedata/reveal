import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter as Router } from 'react-router-dom';

import { AppContextProvider } from '@data-exploration-components/context/AppContext';
import {
  QueryErrorResetBoundary,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { Button, ToastContainer } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';
import { SDKProvider } from '@cognite/sdk-provider';

import { useAuthContext } from '../common/auth/AuthProvider';
import { TopBar } from '../common/topbar/top-bar';

import { queryClient } from './queryClient';
import { CoreRoutes } from './Routes';

function App() {
  const { client } = useAuthContext();

  return (
    <SDKProvider sdk={client}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <ToastContainer />
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallbackRender={({ resetErrorBoundary }) => (
                <div>
                  There was an error!
                  <Button onClick={() => resetErrorBoundary()}>
                    Try again
                  </Button>
                </div>
              )}
            >
              <FlagProvider
                appName="business-portal"
                projectName={`${client.project}`}
                apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
                remoteAddress={window.location.hostname}
              >
                <AppContextProvider
                  flow="AZURE_AD"
                  userInfo={<div />}
                  isAdvancedFiltersEnabled
                >
                  <Router window={window}>
                    <TopBar />

                    <CoreRoutes />
                  </Router>
                </AppContextProvider>
              </FlagProvider>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </QueryClientProvider>
    </SDKProvider>
  );
}

export default App;
