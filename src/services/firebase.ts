import { CogniteClient } from '@cognite/sdk';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

type LoginToFirebaseResponse = {
  firebaseToken: string;
  experiments: string[];
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

export const fetchFirebaseToken = (
  sdk: CogniteClient,
  appsApiUrl: string,
  projectId: string,
  firebaseAppName: string,
  authFlow?: string
) => {
  return sdk
    .get<LoginToFirebaseResponse>(
      `${appsApiUrl}${
        authFlow === 'AZURE_AD' ? `/${projectId}` : ''
      }/login/firebase`,
      {
        params: {
          tenant: projectId,
          app: firebaseAppName,
          json: true,
        },
        withCredentials: true,
      }
    )
    .then((result) => {
      const {
        data: { firebaseToken: nextFirebaseToken },
      } = result;
      localStorage.setItem('@cognite/charts/firebaseToken', nextFirebaseToken);
      return nextFirebaseToken as string;
    });
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
  firebase.initializeApp(env?.firebase as any);
  await firebase.auth().signInWithCustomToken(token as string);
  return true;
};
