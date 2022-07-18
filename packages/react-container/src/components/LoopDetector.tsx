import React from 'react';
import { LoopDetector as CogniteLoopDetector } from '@cognite/react-loop-detector';
import { reportException } from '@cognite/react-errors';

import { ConditionalWrapperWithProps } from './ConditionalWrapper';

export const LoopDetector: React.FC<
  React.PropsWithChildren<{ fallbackUrl?: string }>
> = ({ children, fallbackUrl }) => (
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

export const ConditionalLoopDetector: React.FC<{
  children: React.ReactElement;
  disabled?: boolean;
}> = ({ disabled, children }) => (
  <ConditionalWrapperWithProps condition={!disabled} wrap={LoopDetector}>
    {children}
  </ConditionalWrapperWithProps>
);
