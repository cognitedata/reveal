import React, { FunctionComponent, PropsWithChildren } from 'react';

interface ErrorMessageProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const ErrorMessage: FunctionComponent<ErrorMessageProps> = ({
  className,
  children,
  ...rest
}: PropsWithChildren<ErrorMessageProps>) => {
  return (
    <span className={`error-message ${className}`} {...rest}>
      {children}
    </span>
  );
};
