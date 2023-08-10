import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter as Router } from 'react-router-dom';

import styled from 'styled-components';

import { AppContextProvider } from '@data-exploration-components/context/AppContext';
import { Copilot } from '@fusion/copilot-core';
import {
  Orientation,
  OrientationProvider,
} from '@fusion/shared/user-onboarding-components';
import {
  QueryErrorResetBoundary,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { Button, ToastContainer } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';
import { SDKProvider } from '@cognite/sdk-provider';

import zIndex from '../utils/zIndex';

import { translations } from './common';
import { useAuthContext } from './common/auth/AuthProvider';
import { Onboarding } from './components/Onboarding';
import { TopBar } from './components/topbar/TopBar';
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
        <OrientationProvider>
          <Orientation />
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
                        <Onboarding />
                        <CoreRoutes />
                        <CopilotWrapper>
                          <Copilot sdk={client} />
                        </CopilotWrapper>
                      </Router>
                    </AppContextProvider>
                  </FlagProvider>
                </ErrorBoundary>
              )}
            </QueryErrorResetBoundary>
          </QueryClientProvider>
        </OrientationProvider>
      </SDKProvider>
    </I18nWrapper>
  );
}

export default App;

const CopilotWrapper = styled.div`
  z-index: ${zIndex.COPILOT};
  position: absolute;
`;
