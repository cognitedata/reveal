import * as React from 'react';

import { Loader } from '@cognite/cogs.js';
import { AuthConsumer, ConditionalWrapper } from '@cognite/react-container';

import { SIDECAR } from 'constants/app';

import { ProvideAuthSetup } from './ProvideAuthSetup';
import { ProvideAzureTelemetry } from './ProvideAzureTelemetry';
import { ProvideMixpanelSetup } from './ProvideMixpanelSetup';
import { ProvideProjectConfig } from './ProvideProjectConfig';
import { ProvideUnleash } from './ProvideUnleash';

export const Providers: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  return (
    <ConditionalWrapper condition={!!SIDECAR.unleash} wrap={ProvideUnleash}>
      <AuthConsumer>
        {(authState) => {
          if (!authState || !authState.authState?.authenticated) {
            return <Loader />;
          }

          return (
            <ProvideProjectConfig>
              <ProvideAuthSetup authState={authState}>
                <ProvideAzureTelemetry>
                  <ProvideMixpanelSetup>{children}</ProvideMixpanelSetup>
                </ProvideAzureTelemetry>
              </ProvideAuthSetup>
            </ProvideProjectConfig>
          );
        }}
      </AuthConsumer>
    </ConditionalWrapper>
  );
};
