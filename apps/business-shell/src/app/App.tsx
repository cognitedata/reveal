import { BrowserRouter as Router } from 'react-router-dom';

import { AppContextProvider } from '@data-exploration-components/context/AppContext';
import {
  Orientation,
  OrientationProvider,
} from '@fusion/shared/user-onboarding-components';
import * as Sentry from '@sentry/react';
import {
  QueryErrorResetBoundary,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { ToastContainer } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';
import { SDKProvider } from '@cognite/sdk-provider';

import { translations } from './common';
import { useAuthContext } from './common/auth/AuthProvider';
import { AI } from './components/AI';
import { ErrorFallback } from './components/ErrorFallback';
import { Onboarding } from './components/Onboarding';
import { TopBar } from './components/topbar/TopBar';
import { queryClient } from './queryClient';
import { CoreRoutes } from './Routes';

const LOCIZE_NAME_SPACE = 'business-shell';
const FLAG_TOKEN = 'v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE';

function App() {
  const { client } = useAuthContext();

  return (
    <FlagProvider
      appName="business-portal"
      projectName={client.project}
      apiToken={FLAG_TOKEN}
      remoteAddress={window.location.hostname}
    >
      <I18nWrapper
        translations={translations}
        defaultNamespace={LOCIZE_NAME_SPACE}
      >
        <SDKProvider sdk={client}>
          <OrientationProvider>
            <Orientation />
            <QueryClientProvider client={queryClient}>
              <ReactQueryDevtools initialIsOpen={false} />
              <ToastContainer />
              <QueryErrorResetBoundary>
                {({ reset }) => (
                  <Sentry.ErrorBoundary
                    fallback={({ error, eventId, resetError }) => (
                      <ErrorFallback
                        error={error}
                        eventId={eventId}
                        onResetClick={() => {
                          reset();
                          resetError();
                        }}
                      />
                    )}
                  >
                    <AppContextProvider
                      flow="AZURE_AD"
                      userInfo={<div />}
                      isAdvancedFiltersEnabled
                    >
                      <Router window={window}>
                        <TopBar />
                        <Onboarding />
                        <CoreRoutes />
                        <AI />
                      </Router>
                    </AppContextProvider>
                  </Sentry.ErrorBoundary>
                )}
              </QueryErrorResetBoundary>
            </QueryClientProvider>
          </OrientationProvider>
        </SDKProvider>
      </I18nWrapper>
    </FlagProvider>
  );
}

export default App;
