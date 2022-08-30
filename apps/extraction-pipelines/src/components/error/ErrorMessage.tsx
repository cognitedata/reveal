import React, {
  FunctionComponent,
  PropsWithChildren,
  HTMLAttributes,
} from 'react';
import { Colors } from '@cognite/cogs.js';

interface ErrorMessageProps extends HTMLAttributes<HTMLSpanElement> {}

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
