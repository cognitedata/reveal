import React from 'react';

import { SentryProps, initSentry } from './utils';

export interface SentryComponentProps extends SentryProps {
  children: React.ReactElement<unknown> | null;
}

export const Sentry: React.FC<SentryComponentProps> = ({
  children,
  ...rest
}) => {
  React.useEffect(() => {
    initSentry(rest);
  }, []);

  return children;
};
