import React, { FunctionComponent, PropsWithChildren } from 'react';
import { Colors } from '@cognite/cogs.js';

interface ErrorMessageProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const ErrorMessage: FunctionComponent<ErrorMessageProps> = ({
  children,
  ...rest
}: PropsWithChildren<ErrorMessageProps>) => {
  return (
    <span
      css={`
        color: ${Colors.danger.hex()};
      `}
      {...rest}
    >
      {children}
    </span>
  );
};
