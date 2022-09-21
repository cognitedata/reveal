import * as React from 'react';

import { AuthConsumer, ConditionalWrapper } from '@cognite/react-container';

import { SIDECAR } from 'constants/app';

import { ProvideAuthSetup } from './ProvideAuthSetup';
import { ProvideAzureTelemetry } from './ProvideAzureTelemetry';
import { ProvidePermissions } from './ProvidePermissions';
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
            return null;
          }

          return (
            <ProvideProjectConfig>
              <ProvideAuthSetup authState={authState}>
                <ProvideAzureTelemetry>
                  <ProvidePermissions>{children}</ProvidePermissions>
                </ProvideAzureTelemetry>
              </ProvideAuthSetup>
            </ProvideProjectConfig>
          );
        }}
      </AuthConsumer>
    </ConditionalWrapper>
  );
};
