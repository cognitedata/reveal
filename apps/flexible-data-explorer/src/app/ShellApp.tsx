import { ErrorFallback } from '@fdx/components';
import { Onboarding } from '@fdx/modules/onboarding/Onboarding';
import { translations } from '@fdx/shared/common/i18n';
import { Copilot } from '@fusion/copilot-core';
import {
  Orientation,
  OrientationProvider,
} from '@fusion/shared/user-onboarding-components';
import * as Sentry from '@sentry/react';
import {
  QueryErrorResetBoundary,
  QueryClientProvider,
} from '@tanstack/react-query';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { AuthWrapper, SubAppWrapper } from '@cognite/cdf-utilities';
import { Loader, ToastContainer } from '@cognite/cogs.js';
import { RevealKeepAlive } from '@cognite/reveal-react-components';
import { SDKProvider, useSDK } from '@cognite/sdk-provider';

import FusionStyles from '../FusionStyles';

import { queryClient } from './queryClient';
import AppRoutes from './Routes';

const projectName = 'flexible-data-explorer';

const App = () => {
  const client = useSDK();

  return (
    <OrientationProvider>
      <Orientation />
      <QueryClientProvider client={queryClient}>
        <ToastContainer />
        <AuthWrapper
          loadingScreen={<Loader />}
          login={() => loginAndAuthIfNeeded()}
        >
          <SDKProvider sdk={sdk}>
            <SubAppWrapper title="Search">
              <FusionStyles>
                <I18nWrapper
                  translations={translations}
                  addNamespace={projectName}
                >
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
                        <Copilot sdk={client} showChatButton={false}>
                          <Onboarding />
                          <RevealKeepAlive>
                            <AppRoutes />
                          </RevealKeepAlive>
                        </Copilot>
                      </Sentry.ErrorBoundary>
                    )}
                  </QueryErrorResetBoundary>
                </I18nWrapper>
              </FusionStyles>
            </SubAppWrapper>
          </SDKProvider>
        </AuthWrapper>
      </QueryClientProvider>
    </OrientationProvider>
  );
};

export default App;
