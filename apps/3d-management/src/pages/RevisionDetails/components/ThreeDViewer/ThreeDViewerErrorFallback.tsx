import { Button, Title } from '@cognite/cogs.js';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { logToSentry } from 'utils';

type ThreeDViewerErrorFallbackProps = {
  error: Error;
};

function ThreeDViewerErrorFallback({ error }: ThreeDViewerErrorFallbackProps) {
  return (
    <div role="alert">
      <Title level={2}>Could not view 3D model</Title>
      <br />
      <p>
        3D viewer could not be initialized. This is most commonly caused by one
        of the following reasons:
      </p>
      <ul>
        <li>
          The model is in a deprecated format that is not supported anymore.
          This is typically the problem if the 3D model is very old.
        </li>
        <li>
          WebGL is not supported on your browser. You can check this on{' '}
          <a
            href="https://webglreport.com/?v=2"
            target="_blank"
            rel="noreferrer"
          >
            WebGL report
          </a>
        </li>
      </ul>
      <p>
        Please try again, and contact{' '}
        <a href="mailto:support@cognite.com">support@cognite.com</a> if you are
        not able to resolve the issue. If you contact support, please provide
        the error details below.
      </p>
      <div>
        <Button type="primary" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>
      <hr />
      <p>
        Error details:
        <pre>
          <code>{JSON.stringify(error)}</code>
        </pre>
      </p>
    </div>
  );
}

export default function ThreeDViewerErrorBoundary(props: { children: any }) {
  return (
    <ErrorBoundary
      {...props}
      FallbackComponent={ThreeDViewerErrorFallback}
      onError={(error) => {
        console.error('ThreeD: ', error);
        logToSentry(error);
      }}
    />
  );
}
