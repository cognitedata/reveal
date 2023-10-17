import { ErrorBoundary } from 'react-error-boundary';

import {
  QueryErrorResetBoundary,
  QueryClientProvider,
} from '@tanstack/react-query';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { AuthWrapper, SubAppWrapper } from '@cognite/cdf-utilities';
import { Button, Loader, ToastContainer } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider';

import FusionStyles from '../FusionStyles';
import { translations } from '../i18n';

import { queryClient } from './queryClient';
import AppRoutes from './Routes';

const App = () => {
  const projectName = 'flexible-data-explorer';

  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer />
      <AuthWrapper
        loadingScreen={<Loader />}
        login={() => loginAndAuthIfNeeded()}
      >
        <SDKProvider sdk={sdk}>
          <SubAppWrapper title="Flexible Data Explorer">
            <FusionStyles>
              <I18nWrapper
                translations={translations}
                addNamespace={projectName}
              >
                <QueryErrorResetBoundary>
                  {({ reset }) => (
                    <ErrorBoundary
                      onReset={reset}
                      fallbackRender={({ resetErrorBoundary }) => (
                        <center>
                          There was an error!
                          <Button
                            onClick={() => {
                              resetErrorBoundary();
                            }}
                          >
                            Try again!
                          </Button>
                        </center>
                      )}
                    >
                      <AppRoutes />
                    </ErrorBoundary>
                  )}
                </QueryErrorResetBoundary>
              </I18nWrapper>
            </FusionStyles>
          </SubAppWrapper>
        </SDKProvider>
      </AuthWrapper>
    </QueryClientProvider>
  );
};

export default App;
