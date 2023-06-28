import config from '@charts-app/config/config';
import {
  fetchFirebaseEnvironment,
  fetchFirebaseToken,
  initializeFirebase,
} from '@charts-app/services/firebase';
import { useQuery } from '@tanstack/react-query';

import { getProject } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';

import { useAppsApiBaseUrl } from './config';

const cacheOption = {
  staleTime: Infinity,
  cacheTime: Infinity,
};

export const useFirebaseInit = (enabled: boolean) => {
  const sdk = useSDK();
  // @ts-ignore
  const sdkClientBaseUrl = sdk.httpClient.getBaseUrl();
  const url = useAppsApiBaseUrl(sdkClientBaseUrl);
  const project = getProject();

  return useQuery(
    ['firebase', 'init'],
    async () => {
      const token = await fetchFirebaseToken(
        sdk,
        url,
        project,
        config.firebaseAppName
      );
      const env = await fetchFirebaseEnvironment(
        sdk,
        project,
        url,
        config.firebaseAppName
      );
      return initializeFirebase(env!, token!);
    },
    {
      ...cacheOption,
      enabled,
    }
  );
};
