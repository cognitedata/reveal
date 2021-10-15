import React from 'react';
import { Sentry as SentryComponent, SentryProps } from '@cognite/react-sentry';
import { History } from 'history';

import { ConditionalWrapperWithProps } from './ConditionalWrapper';

export const Sentry: React.FC<SentryProps> = ({ children, history }) => (
  <SentryComponent history={history}>
    <>{children}</>
  </SentryComponent>
);

export const ConditionalSentry: React.FC<{
  children: React.ReactElement;
  disabled?: boolean;
  history: History;
}> = ({ disabled, children }) => {
  return (
    <ConditionalWrapperWithProps condition={!disabled} wrap={Sentry}>
      {children}
    </ConditionalWrapperWithProps>
  );
};
