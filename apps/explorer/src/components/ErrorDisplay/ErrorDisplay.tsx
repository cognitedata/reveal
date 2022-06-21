import React from 'react';

import { ErrorBody, ErrorHeader } from './elements';

export const ErrorDisplay: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  return (
    <>
      <ErrorHeader>An Error has occurred</ErrorHeader>
      <ErrorBody>{children}</ErrorBody>
    </>
  );
};
