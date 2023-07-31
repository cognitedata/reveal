import React from 'react';
import { Sentry as SentryComponent, SentryProps } from '@cognite/react-sentry';

import { ConditionalWrapperWithProps } from './ConditionalWrapper';

export const Sentry: React.FC<React.PropsWithChildren<SentryProps>> = ({
  children,
  ...sentrySettings
}) => (
  <SentryComponent {...sentrySettings}>
    <>{children}</>
  </SentryComponent>
);

export const ConditionalSentry: React.FC<
  {
    children: React.ReactElement;
    disabled?: boolean;
  } & SentryProps
> = ({ disabled, children, ...rest }) => {
  return (
    <ConditionalWrapperWithProps condition={!disabled} wrap={Sentry} {...rest}>
      {children}
    </ConditionalWrapperWithProps>
  );
};
