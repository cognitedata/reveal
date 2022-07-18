import React from 'react';

import { Loader } from '@cognite/cogs.js';

import { useProjectConfig } from 'hooks/useProjectConfig';

export const ProvideProjectConfig: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children }) => {
  const { isLoading } = useProjectConfig(); // initialise Project Config

  if (isLoading) {
    return <Loader />;
  }

  return <>{children}</>;
};
