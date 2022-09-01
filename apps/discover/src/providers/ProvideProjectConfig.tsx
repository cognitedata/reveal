import * as React from 'react';

import { useProjectConfig } from 'hooks/useProjectConfig';

export const ProvideProjectConfig: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children }) => {
  const { isLoading } = useProjectConfig(); // initialise Project Config

  if (isLoading) {
    return null;
  }

  return <>{children}</>;
};
