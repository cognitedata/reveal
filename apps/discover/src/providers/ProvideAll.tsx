import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { Loader } from '@cognite/cogs.js';
import { AuthConsumer, ConditionalWrapper } from '@cognite/react-container';

import { SIDECAR } from 'constants/app';

import { Observer } from './Observer';
import { ProvideAuthSetup } from './ProvideAuthSetup';
import { ProvideAzureTelemetry } from './ProvideAzureTelemetry';
import { ProvideMixpanelSetup } from './ProvideMixpanelSetup';
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
        <ProvideAzureTelemetry>
          <AuthConsumer>
            {(authState) => {
              if (!authState || !authState.authState?.authenticated) {
                return <Loader />;
              }

              return (
                <ProvideAuthSetup authState={authState}>
                  <ProvideTenantSetup>
                    <ProvideMixpanelSetup>
                      <Observer>{children}</Observer>
                    </ProvideMixpanelSetup>
                  </ProvideTenantSetup>
                </ProvideAuthSetup>
              );
            }}
          </AuthConsumer>
        </ProvideAzureTelemetry>
      </QueryClientProvider>
    </ConditionalWrapper>
  );
};
