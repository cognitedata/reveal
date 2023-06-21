import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter as Router } from 'react-router-dom';

import { AppContextProvider } from '@data-exploration-components/context/AppContext';
import {
  QueryErrorResetBoundary,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { Button, ToastContainer } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';
import { SDKProvider } from '@cognite/sdk-provider';

import { translations } from './common';
import { useAuthContext } from './common/auth/AuthProvider';
import { TopBar } from './components/topbar/top-bar';
import { queryClient } from './queryClient';
import { CoreRoutes } from './Routes';

const LOCIZE_NAME_SPACE = 'business-shell';

function App() {
  const { client } = useAuthContext();

  return (
    <I18nWrapper
      translations={translations}
      defaultNamespace={LOCIZE_NAME_SPACE}
    >
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
    </I18nWrapper>
  );
}

export default App;
