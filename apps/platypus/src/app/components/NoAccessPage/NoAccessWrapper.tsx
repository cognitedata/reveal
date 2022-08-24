import React from 'react';
import { Loader } from '@cognite/cogs.js';
import NoAccessPage from './NoAccessPage';
import { useCapabilities } from '@platypus-app/hooks/useCapabilities';
import config from '@platypus-app/config/config';

const NoAccessWrapper = ({ children }: { children: JSX.Element }) => {
  const dataModelInstancesAcl = useCapabilities('dataModelInstancesAcl', [
    'READ',
    'WRITE',
  ]);
  const dataModelsAcl = useCapabilities(
    'dataModelsAcl',
    ['READ', 'WRITE'],
    [config.DATA_MODELS_GROUP_NAME]
  );
  if (dataModelsAcl.isError || dataModelInstancesAcl.isError) {
    return <NoAccessPage />;
  }
  if (!dataModelInstancesAcl.isFetched || !dataModelsAcl.isFetched) {
    return <Loader />;
  }

  if (
    // isAclSupported checks specifically user token for both acls
    // dataModelsAcl.isAuthorized checks whether requested groups are present in cdf groups data
    (dataModelInstancesAcl.isAclSupported && dataModelsAcl.isAclSupported) ||
    dataModelsAcl.isAuthorized
  ) {
    return children;
  }
  return <NoAccessPage />;
};

export default NoAccessWrapper;
