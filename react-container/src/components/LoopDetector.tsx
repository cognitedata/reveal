import React from 'react';
import { LoopDetector as CogniteLoopDetector } from '@cognite/react-loop-detector';
import { reportException } from '@cognite/react-errors';

export const LoopDetector: React.FC<{ fallbackUrl?: string }> = ({
  children,
  fallbackUrl,
}) => {
  return (
    <CogniteLoopDetector
      onLoopDetected={(records) => {
        reportException(new Error('Login loop detected'), { records }).finally(
          () => {
            window.location.href =
              fallbackUrl ||
              'https://docs.cognite.com/dev/guides/iam/external-application.html';
          }
        );
      }}
    >
      {children}
    </CogniteLoopDetector>
  );
};
