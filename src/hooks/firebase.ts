import { useSDK } from '@cognite/sdk-provider';
import config from 'config';
import { useQuery } from 'react-query';
import { getTenantFromURL } from 'utils/env';
import firebase from 'firebase/app';

export type EnvironmentConfig = {
  cognite: {
    project: string;
    baseUrl?: string;
  };
  firebase: {
    databaseURL: string;
  };
};

export type LoginToFirebaseResponse = {
  firebaseToken: string;
  experiments: string[];
};

export type GetEnvironmentResponse = {
  tenant: string;
  config: EnvironmentConfig;
};

const APPS_API_BASE_URL = config.appsApiBaseURL;
const APP_NAME = config.appName;

const cacheOption = {
  staleTime: Infinity,
  cacheTime: Infinity,
};

export const useFirebaseToken = () => {
  const sdk = useSDK();
  const project = getTenantFromURL();

  return useQuery<string>(
    ['firebase', 'token'],
    () =>
      sdk
        .get<LoginToFirebaseResponse>(`${APPS_API_BASE_URL}/login/firebase`, {
          params: {
            tenant: project,
            app: APP_NAME,
            json: true,
          },
          withCredentials: true,
        })
        .then((result) => {
          const {
            data: { firebaseToken: nextFirebaseToken },
          } = result;
          return nextFirebaseToken as string;
        }),
    cacheOption
  );
};

export const useFirebaseEnv = () => {
  const sdk = useSDK();
  const project = getTenantFromURL();

  return useQuery<EnvironmentConfig>(
    ['firebase', 'env'],
    () =>
      sdk
        .get<GetEnvironmentResponse>(`${APPS_API_BASE_URL}/env`, {
          params: {
            tenant: project,
            app: APP_NAME,
            version: '0.0.0',
          },
          withCredentials: true,
        })
        .then((result) => result.data.config),
    cacheOption
  );
};

export const useFirebase = (enabled: boolean) => {
  const { data: token, isFetched: tokenFetched } = useFirebaseToken();
  const { data: env, isFetched: configFetched } = useFirebaseEnv();

  return useQuery(
    ['firebase', 'init'],
    async () => {
      if (firebase.apps.length !== 0) {
        // If we're already initialized, don't do it again
        return true;
      }
      firebase.initializeApp(env?.firebase as any);

      await firebase.auth().signInWithCustomToken(token as string);
      firebase.firestore().settings({ experimentalForceLongPolling: true });
      return true;
    },
    {
      enabled: enabled && tokenFetched && configFetched && !!token && !!env,
      ...cacheOption,
    }
  );
};
