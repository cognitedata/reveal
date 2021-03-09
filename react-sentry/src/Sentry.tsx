import React from 'react';

import { Props as SentryProps, initSentry } from './utils';

export interface Props extends SentryProps {
  children: React.ReactElement<unknown> | null;
}

export const Sentry: React.FC<Props> = ({ children, ...rest }) => {
  React.useEffect(() => {
    initSentry(rest);
  }, []);

  return children;
};
