import React from 'react';
import { Sentry as SentryComponent, SentryProps } from '@cognite/react-sentry';

import { ConditionalWrapperWithProps } from './ConditionalWrapper';

export const Sentry: React.FC<SentryProps> = ({ children }) => (
  <SentryComponent>
    <>{children}</>
  </SentryComponent>
);

export const ConditionalSentry: React.FC<{
  children: React.ReactElement;
  disabled?: boolean;
}> = ({ disabled, children }) => (
  <ConditionalWrapperWithProps condition={!disabled} wrap={Sentry}>
    {children}
  </ConditionalWrapperWithProps>
);
