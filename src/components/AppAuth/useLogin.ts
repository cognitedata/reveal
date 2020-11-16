import { useEffect, useState } from 'react';
import client from 'services/CogniteSDK';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import config from 'config';
import useDispatch from 'hooks/useDispatch';
import environmentSlice from 'reducers/environment';
import * as Sentry from '@sentry/browser';
import { Metrics } from '@cognite/metrics';

type LoginOptions = {
  project?: string;
};

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

const useLogin = ({ project }: LoginOptions = {}) => {
  const [authenticating, setAuthenticating] = useState(true);
  const [token, setToken] = useState<string>();
  const [firebaseToken, setFirebaseToken] = useState<string>();
  const [firebaseConfig, setFirebaseConfig] = useState<object>();

  const dispatch = useDispatch();

  const authToCDF = async () => {
    if (!project) {
      return;
    }
    const startingStatus = await client.login.status();
    if (startingStatus?.user) {
      // We're already logged in!
      setAuthenticating(false);
      return;
    }

    if (process.env.REACT_APP_API_KEY) {
      client.loginWithApiKey({
        apiKey: process.env.REACT_APP_API_KEY,
        project,
      });
      setToken('API_KEY');
      setAuthenticating(false);
      dispatch(
        environmentSlice.actions.loginSuccess({
          email: 'API KEY',
        })
      );
      return;
    }

    client.loginWithOAuth({
      project,
      onTokens: async (oAuthToken) => {
        const status = await client.login.status();

        Sentry.setUser({ id: status?.user });

        setToken(oAuthToken.accessToken);
        setAuthenticating(false);
        Metrics.identify(status?.user || 'UNKNOWN');
        Metrics.props({ tenant: project });
        dispatch(
          environmentSlice.actions.loginSuccess({ email: status?.user })
        );
      },
    });

    client.authenticate();
  };

  // CDF authentication
  useEffect(() => {
    authToCDF();
  }, [dispatch, project]);

  // Getting Auth token for Firebase via Apps API
  useEffect(() => {
    if (!token) {
      return;
    }

    client
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
        setFirebaseToken(nextFirebaseToken);
      });
  }, [project, token]);

  // Getting environment from apps api, incl. firebase config
  useEffect(() => {
    if (!token) {
      return;
    }

    client
      .get<GetEnvironmentResponse>(`${APPS_API_BASE_URL}/env`, {
        params: {
          tenant: project,
          app: APP_NAME,
          version: '0.0.0',
        },
        withCredentials: true,
      })
      .then((result) => {
        const {
          data: { config: nextConfig },
        } = result;
        setFirebaseConfig(nextConfig.firebase);
      });
  }, [dispatch, project, token]);

  // Authenticating with firebase using custom token
  useEffect(() => {
    if (!firebaseToken || !firebaseConfig) {
      return;
    }
    if (firebase.apps.length !== 0) {
      // If we're already initialized, don't do it again
      return;
    }
    firebase.initializeApp(firebaseConfig);
    try {
      firebase.auth().signInWithCustomToken(firebaseToken);
      firebase.firestore().settings({ experimentalForceLongPolling: true });

      // Let components know firebase is ready to take requests!
      dispatch(environmentSlice.actions.onFirebaseReady());
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Bad auth', e);
    }
  }, [project, firebaseToken, firebaseConfig]);

  return { authenticating };
};

export default useLogin;
