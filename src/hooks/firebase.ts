import { useSDK } from '@cognite/sdk-provider';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import config, { CHART_VERSION, useAppsApiBaseUrl } from 'config';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useProject, useLoginStatus, getProject } from 'hooks';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { Chart } from 'reducers/charts/types';
import { IdInfo } from '@cognite/sdk';

type EnvironmentConfig = {
  cognite: {
    project: string;
    baseUrl?: string;
  };
  firebase: {
    databaseURL: string;
  };
};

type LoginToFirebaseResponse = {
  firebaseToken: string;
  experiments: string[];
};

type GetEnvironmentResponse = {
  tenant: string;
  config: EnvironmentConfig;
};

const APP_NAME = config.appName;

const cacheOption = {
  staleTime: Infinity,
  cacheTime: Infinity,
};

const useFirebaseToken = (enabled: boolean) => {
  const sdk = useSDK();
  const project = useProject();
  const url = useAppsApiBaseUrl();

  return useQuery<string>(
    ['firebase', 'token'],
    () =>
      sdk
        .get<LoginToFirebaseResponse>(`${url}/login/firebase`, {
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
    { ...cacheOption, enabled }
  );
};

const useFirebaseEnv = (enabled: boolean) => {
  const sdk = useSDK();
  const project = useProject();
  const url = useAppsApiBaseUrl();

  return useQuery<EnvironmentConfig>(
    ['firebase', 'env', url],
    () =>
      sdk
        .get<GetEnvironmentResponse>(`${url}/env`, {
          params: {
            tenant: project,
            app: APP_NAME,
            version: '0.0.0',
          },
          withCredentials: true,
        })
        .then((result) => result.data.config),
    { ...cacheOption, enabled }
  );
};

export const useFirebaseInit = (enabled: boolean) => {
  const { data: token, isFetched: tokenFetched } = useFirebaseToken(enabled);
  const { data: env, isFetched: configFetched } = useFirebaseEnv(enabled);

  return useQuery(
    ['firebase', 'init'],
    async () => {
      if (firebase.apps.length !== 0) {
        // If we're already initialized, don't do it again
        return true;
      }
      firebase.initializeApp(env?.firebase as any);

      await firebase.auth().signInWithCustomToken(token as string);
      // firebase.firestore().settings({   experimentalForceLongPolling: true });
      return true;
    },
    {
      ...cacheOption,
      enabled: enabled && tokenFetched && configFetched && !!token && !!env,
    }
  );
};

export const charts = () => {
  return firebase
    .firestore()
    .collection('tenants')
    .doc(getProject())
    .collection('charts');
};

export const useMyCharts = () => {
  const { data } = useLoginStatus();

  return useQuery(
    ['charts', 'mine'],
    async () => {
      const snapshot = await charts()
        .where('version', '==', CHART_VERSION)
        .where('user', '==', data?.user)
        .get();
      return snapshot.docs.map((doc) => doc.data()) as Chart[];
    },
    { enabled: !!data?.user }
  );
};

export const usePublicCharts = () => {
  const { data } = useLoginStatus();

  return useQuery(
    ['charts', 'public'],
    async () => {
      const snapshot = await charts()
        .where('version', '==', CHART_VERSION)
        .where('public', '==', true)
        .get();
      return snapshot.docs.map((doc) => doc.data()) as Chart[];
    },
    { enabled: !!data?.user }
  );
};

export const useChart = (id: string) => {
  return useQuery(
    ['chart', id],
    async () => (await charts().doc(id).get()).data() as Chart,
    {
      enabled: !!id,
      staleTime: Infinity,
    }
  );
};

export const useDeleteChart = () => {
  const cache = useQueryClient();
  return useMutation(
    async (chartId: string) => {
      await charts().doc(chartId).delete();
      return chartId;
    },
    {
      onSuccess: (chartId) => {
        cache.invalidateQueries(['charts']);
        cache.invalidateQueries(['chart', chartId]);
      },
    }
  );
};

export const useUpdateChart = () => {
  const cache = useQueryClient();
  return useMutation(
    async (chart: Chart) => {
      const skipPersist =
        cache.getQueryData<IdInfo>(['login', 'status'])?.user !== chart.user;
      // skipPersist will result in only the local cache being updated.
      if (!skipPersist) {
        // The firestore SDK will retry indefinitely
        const updatedChart: Chart = omit(
          {
            ...chart,
            updatedAt: Date.now(),
          },
          'dirty'
        );
        await charts().doc(chart.id).set(updatedChart, { merge: true });
      }
      return chart.id;
    },
    {
      onMutate(chart) {
        const skipPersist =
          cache.getQueryData<IdInfo>(['login', 'status'])?.user !== chart.user;
        const key = ['chart', chart.id];
        const cachedChart = cache.getQueryData(key);

        if (!isEqual(cachedChart, chart)) {
          cache.setQueryData(key, {
            ...chart,
            dirty: skipPersist,
          });
        }
      },
      onError(_, chart) {
        cache.invalidateQueries(['chart', chart.id]);
      },
      onSettled() {
        cache.invalidateQueries(['charts']);
      },
    }
  );
};
