import React from 'react';
import {
  ErrorBoundary as ReactErrorBoundary,
  ErrorBoundaryPropsWithComponent,
} from 'react-error-boundary';
import { Button, Title } from '@cognite/cogs.js';
import { logToSentry } from 'utils';

const DefaultFallback = () => {
  return (
    <div role="alert">
      <Title level={1}>Something went wrong.</Title>
      <br />
      <p>
        You have encountered an internal error. We have been notified, but
        please reach out to{' '}
        <a href="mailto:support@cognite.com">support@cognite.com</a> if you are
        stuck.
      </p>
      <p>Please reload the page to try again.</p>
      <div>
        <Button type="primary" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>
    </div>
  );
};

export default function ErrorBoundary(
  props: Partial<ErrorBoundaryPropsWithComponent> & { children: any }
) {
  return (
    <ReactErrorBoundary
      {...props}
      FallbackComponent={props.FallbackComponent || DefaultFallback}
      onError={(error, errorInfo) => {
        logToSentry(error);

        if (props.onError) {
          props.onError(error, errorInfo);
        }
      }}
    />
  );
}
