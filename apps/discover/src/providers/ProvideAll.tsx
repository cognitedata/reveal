import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { Loader } from '@cognite/cogs.js';
import { AuthConsumer, ConditionalWrapper } from '@cognite/react-container';

import { SIDECAR } from 'constants/app';

import { Observer } from './Observer';
import { ProvideAuthSetup } from './ProvideAuthSetup';
import { ProvideAzureTelemetry } from './ProvideAzureTelemetry';
import { ProvideMixpanelSetup } from './ProvideMixpanelSetup';
import { ProvideProjectConfig } from './ProvideProjectConfig';
import { ProvideTenantSetup } from './ProvideTenantSetup';
import { ProvideUnleash } from './ProvideUnleash';

export const Providers: React.FC = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity, // when to re-fetch if stale
        cacheTime: Infinity,
      },
    },
  });

  return (
    <ConditionalWrapper condition={!!SIDECAR.unleash} wrap={ProvideUnleash}>
      <QueryClientProvider client={queryClient}>
        <AuthConsumer>
          {(authState) => {
            if (!authState || !authState.authState?.authenticated) {
              return <Loader />;
            }

            return (
              <ProvideAuthSetup authState={authState}>
                <ProvideProjectConfig>
                  <ProvideAzureTelemetry>
                    <ProvideTenantSetup>
                      <ProvideMixpanelSetup>
                        <Observer>{children}</Observer>
                      </ProvideMixpanelSetup>
                    </ProvideTenantSetup>
                  </ProvideAzureTelemetry>
                </ProvideProjectConfig>
              </ProvideAuthSetup>
            );
          }}
        </AuthConsumer>
      </QueryClientProvider>
    </ConditionalWrapper>
  );
};
