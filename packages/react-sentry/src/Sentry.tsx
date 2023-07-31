import * as React from 'react';
import * as ReactSentry from '@sentry/react';
import { ErrorPage } from '@cognite/react-errors';

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

  if (rest.disableAdvancedTracking) {
    return children;
  }

  return (
    <ReactSentry.ErrorBoundary fallback={<ErrorPage />} showDialog>
      {children}
    </ReactSentry.ErrorBoundary>
  );
};
