import React from 'react';
import { Loader } from '@cognite/cogs.js';
import { AclDataSets, Group } from '@cognite/sdk';
import { useQuery } from 'react-query';
import NoAccessPage from './NoAccessPage';
import { getCogniteSDKClient } from '../../../environments/cogniteSdk';
import config from '@platypus-app/config/config';

type DataSetsCapability = {
  datasetsAcl: AclDataSets;
};

const hasDataSetsRead = (group: Group) =>
  group.capabilities?.some((capability) =>
    (capability as DataSetsCapability).datasetsAcl?.actions.includes('READ')
  );

const NoAccessWrapper = ({ children }: { children: JSX.Element }) => {
  const cdfClient = getCogniteSDKClient();

  const {
    data: groups,
    isFetched,
    error,
  } = useQuery('groups', () => cdfClient.groups.list());

  if (error) {
    return <NoAccessPage />;
  }
  if (!isFetched) {
    return <Loader />;
  }

  const requiredGroups = [
    config.MIXER_API_GROUP_NAME,
    config.DMS_API_GROUP_NAME,
  ];
  const userGroupNames = groups?.map((group) => group.name);
  const isAuthorized =
    groups &&
    requiredGroups.every((groupName) => userGroupNames?.includes(groupName)) &&
    groups.some(hasDataSetsRead);

  if (isAuthorized) {
    return children;
  }
  return <NoAccessPage />;
};

export default NoAccessWrapper;
