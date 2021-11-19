import * as React from 'react';

import { Loader } from '@cognite/cogs.js';
import { AuthConsumer, ConditionalWrapper } from '@cognite/react-container';

import { SIDECAR } from 'constants/app';

import { ProvideAuthSetup } from './ProvideAuthSetup';
import { ProvideAzureTelemetry } from './ProvideAzureTelemetry';
import { ProvideMixpanelSetup } from './ProvideMixpanelSetup';
import { ProvideProjectConfig } from './ProvideProjectConfig';
import { ProvideTenantSetup } from './ProvideTenantSetup';
import { ProvideUnleash } from './ProvideUnleash';

export const Providers: React.FC = ({ children }) => {
  return (
    <ConditionalWrapper condition={!!SIDECAR.unleash} wrap={ProvideUnleash}>
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
                    <ProvideMixpanelSetup>{children}</ProvideMixpanelSetup>
                  </ProvideTenantSetup>
                </ProvideAzureTelemetry>
              </ProvideProjectConfig>
            </ProvideAuthSetup>
          );
        }}
      </AuthConsumer>
    </ConditionalWrapper>
  );
};
