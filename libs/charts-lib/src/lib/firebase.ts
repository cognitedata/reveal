import { getAuth, signInWithCustomToken } from 'firebase/auth';
import firebase from 'firebase/compat/app';

import { getCluster, isProduction } from '@cognite/cdf-utilities';
import { parseEnvFromCluster } from '@cognite/login-utils';
import { CogniteClient } from '@cognite/sdk';

type LoginToFirebaseResponse = {
  firebaseToken: string;
  experiments: string[];
};
export const getAppsApiBaseUrl = (sdkClientBaseUrl: string): string => {
  const cluster = getCluster();
  const clusterEnv = parseEnvFromCluster(cluster as string);
  const env =
    clusterEnv === '' ? parseEnvFromCluster(sdkClientBaseUrl) : clusterEnv;
  const stagingPart = isProduction() ? '' : 'staging';
  const url = ['apps-api', stagingPart, env, 'cognite', 'ai']
    .filter(Boolean)
    .join('.');
  return `https://${url}`;
};
type GetEnvironmentResponse = {
  tenant: string;
  config: EnvironmentConfig;
};
type EnvironmentConfig = {
  cognite: {
    project: string;
    baseUrl?: string;
  };
  firebase: {
    databaseURL: string;
  };
};
export const fetchFirebaseEnvironment = async (
  sdk: CogniteClient,
  projectId: string,
  appsApiUrl: string,
  firebaseAppName: string
) => {
  return sdk
    .get<GetEnvironmentResponse>(`${appsApiUrl}/env`, {
      params: {
        tenant: projectId,
        app: firebaseAppName,
        version: '0.0.0',
      },
      withCredentials: true,
    })
    .then((result) => result.data.config);
};
export const initializeFirebase = async (
  env: EnvironmentConfig,
  token: string
) => {
  if (firebase.apps.length !== 0) {
    // If we're already initialized, don't do it again
    return true;
  }
  firebase.initializeApp(env?.firebase);
  await signInWithCustomToken(getAuth(), token as string);
  return true;
};
export const fetchFirebaseToken = (
  sdk: CogniteClient,
  appsApiUrl: string,
  projectId: string,
  firebaseAppName: string
) => {
  return sdk
    .get<LoginToFirebaseResponse>(`${appsApiUrl}/${projectId}/login/firebase`, {
      params: {
        tenant: projectId,
        app: firebaseAppName,
        json: true,
      },
      withCredentials: true,
    })
    .then((result) => {
      const {
        data: { firebaseToken: nextFirebaseToken },
      } = result;
      localStorage.setItem('@cognite/charts/firebaseToken', nextFirebaseToken);
      return nextFirebaseToken as string;
    });
};
