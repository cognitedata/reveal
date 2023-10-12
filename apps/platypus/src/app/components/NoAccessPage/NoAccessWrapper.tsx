import React from 'react';

import { Loader } from '@cognite/cogs.js';

import { useCapabilities } from '../../hooks/useCapabilities';

import NoAccessPage from './NoAccessPage';

const NoAccessWrapper = ({ children }: { children: JSX.Element }) => {
  const dataModelInstancesAcl = useCapabilities('dataModelInstancesAcl', [
    'READ',
  ]);
  const dataModelsAcl = useCapabilities('dataModelsAcl', ['READ']);
  if (dataModelsAcl.isError || dataModelInstancesAcl.isError) {
    return <NoAccessPage />;
  }
  if (!dataModelInstancesAcl.isFetched || !dataModelsAcl.isFetched) {
    return <Loader />;
  }

  if (
    // isAclSupported checks specifically user token for both acls
    dataModelInstancesAcl.isAclSupported &&
    dataModelsAcl.isAclSupported
  ) {
    return children;
  }
  return <NoAccessPage />;
};

export default NoAccessWrapper;
