import React from 'react';
import { Loader } from '@cognite/cogs.js';
import NoAccessPage from './NoAccessPage';
import { useCapabilities } from '@platypus-app/hooks/useCapabilities';

const NoAccessWrapper = ({ children }: { children: JSX.Element }) => {
  const { isError, isFetched, isAuthorized } = useCapabilities();
  if (isError) {
    return <NoAccessPage />;
  }
  if (!isFetched) {
    return <Loader />;
  }

  if (isAuthorized) {
    return children;
  }
  return <NoAccessPage />;
};

export default NoAccessWrapper;
