import React from 'react';
import { Loader } from '@cognite/cogs.js';
import { useQuery } from 'react-query';
import NoAccessPage from './NoAccessPage';
import { getCogniteSDKClient } from '../../../environments/cogniteSdk';
import config from '@platypus-app/config/config';

const NoAccessWrapper = ({ children }: { children: JSX.Element }) => {
  const cdfClient = getCogniteSDKClient();

  const {
    data: groups,
    isFetched: isGroupsFetched,
    error: isGroupError,
  } = useQuery('groups', () => cdfClient.groups.list());

  const {
    data: token,
    isFetched: isTokenFetched,
    error: isTokenError,
  } = useQuery('token', () => cdfClient.get('/api/v1/token/inspect'));

  if (isGroupError && isTokenError) {
    return <NoAccessPage />;
  }
  if (!isGroupsFetched || !isTokenFetched) {
    return <Loader />;
  }

  const requiredGroups = [
    config.MIXER_API_GROUP_NAME,
    config.DMS_API_GROUP_NAME,
  ];

  const userGroupNames = groups?.map((group) => group.name);
  const userCapabilities: string[] = token?.data.capabilities.reduce(
    (prev: string[], current: any) => {
      if (
        current?.experimentAcl &&
        current?.experimentAcl?.scope?.experimentscope?.experiments?.length >= 1
      ) {
        return prev.concat(
          current.experimentAcl.scope.experimentscope.experiments
        );
      }
      return prev;
    },
    [] as string[]
  );

  const isAuthorized =
    (groups &&
      requiredGroups.every((groupName) =>
        userGroupNames?.includes(groupName)
      )) ||
    (token &&
      requiredGroups.every((groupName) =>
        userCapabilities?.includes(groupName)
      ));

  if (isAuthorized) {
    return children;
  }
  return <NoAccessPage />;
};

export default NoAccessWrapper;
