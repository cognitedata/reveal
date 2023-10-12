import { useQuery } from '@tanstack/react-query';

import { getProject } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';

import config from './config';
import {
  fetchFirebaseEnvironment,
  fetchFirebaseToken,
  getAppsApiBaseUrl,
  initializeFirebase,
} from './firebase';

const cacheOption = {
  staleTime: Infinity,
  cacheTime: Infinity,
};
export const useFirebaseInit = (enabled: boolean) => {
  const sdk = useSDK();
  // @ts-ignore
  const sdkClientBaseUrl = sdk.httpClient.getBaseUrl();
  const url = getAppsApiBaseUrl(sdkClientBaseUrl);
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
