import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { getFlow } from '@cognite/auth-utils';
import config from 'config/config';
import {
  fetchFirebaseEnvironment,
  fetchFirebaseToken,
  initializeFirebase,
} from 'services/firebase';
import { useAppsApiBaseUrl, useCluster, useProject } from './config';

const cacheOption = {
  staleTime: Infinity,
  cacheTime: Infinity,
};

export const useFirebaseInit = (enabled: boolean) => {
  const sdk = useSDK();
  const [cluster] = useCluster();
  const project = useProject();
  const url = useAppsApiBaseUrl();
  const { flow } = getFlow(project, cluster);

  return useQuery(
    ['firebase', 'init'],
    async () => {
      const token = await fetchFirebaseToken(
        sdk,
        url,
        project,
        config.firebaseAppName,
        flow
      );
      const env = await fetchFirebaseEnvironment(
        sdk,
        project,
        url,
        config.firebaseAppName
      );
      await initializeFirebase(env!, token!);
    },
    {
      ...cacheOption,
      enabled,
    }
  );
};
