import { useSDK } from '@cognite/sdk-provider';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import config, { CHART_VERSION } from 'config';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { Chart } from 'models/chart/types';
import { getFlow } from '@cognite/auth-utils';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { uniqBy } from 'lodash';
import { useAppsApiBaseUrl, useCluster, useProject } from './config';

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
  const [cluster] = useCluster();
  const project = useProject();
  const url = useAppsApiBaseUrl();

  const { flow } = getFlow(project, cluster);

  return useQuery<string>(
    ['firebase', 'token'],
    () =>
      sdk
        .get<LoginToFirebaseResponse>(
          `${url}${flow === 'AZURE_AD' ? `/${project}` : ''}/login/firebase`,
          {
            params: {
              tenant: project,
              app: APP_NAME,
              json: true,
            },
            withCredentials: true,
          }
        )
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

export const charts = (project: string) => {
  return firebase
    .firestore()
    .collection('tenants')
    .doc(project)
    .collection('charts');
};

export const useMyCharts = () => {
  const { data } = useUserInfo();
  const project = useProject();

  return useQuery(
    ['charts', 'mine'],
    async () => {
      const chartsWhereUserMatchesId = (
        await charts(project)
          .where('version', '==', CHART_VERSION)
          .where('user', '==', data?.id)
          .get()
      ).docs.map((doc) => doc.data()) as Chart[];

      const chartsWhereUserMatchesEmail = (
        await charts(project)
          .where('version', '==', CHART_VERSION)
          .where('user', '==', data?.email)
          .get()
      ).docs.map((doc) => doc.data()) as Chart[];

      const userCharts = uniqBy(
        [...chartsWhereUserMatchesId, ...chartsWhereUserMatchesEmail],
        'id'
      );

      return userCharts;
    },
    { enabled: !!data?.id }
  );
};

export const usePublicCharts = () => {
  const { data } = useUserInfo();
  const project = useProject();

  return useQuery(
    ['charts', 'public'],
    async () => {
      const snapshot = await charts(project)
        .where('version', '==', CHART_VERSION)
        .where('public', '==', true)
        .get();
      return snapshot.docs.map((doc) => doc.data()) as Chart[];
    },
    { enabled: !!data?.id }
  );
};

export const useChart = (id: string) => {
  const project = useProject();

  return useQuery(
    ['chart', id],
    async () => (await charts(project).doc(id).get()).data() as Chart,
    {
      enabled: !!id,
      staleTime: Infinity,
    }
  );
};

export const useDeleteChart = () => {
  const cache = useQueryClient();
  const project = useProject();

  return useMutation(
    async (chartId: string) => {
      await charts(project).doc(chartId).delete();
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
  const { data } = useUserInfo();
  const project = useProject();

  return useMutation(
    async (chart: Chart) => {
      const skipPersist = data?.id !== chart.user;
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
        await charts(project).doc(chart.id).set(updatedChart, { merge: true });
      }
      return chart.id;
    },
    {
      onMutate(chart) {
        /**
         * Check if the chart you're changing is your own or a public one
         * For public ones we do not try to push the change to the server,
         * but still allow you to change it locally so that you can
         * later duplicate and save it as your own if you want
         */
        const skipPersist = !(
          data?.id === chart.user || data?.email === chart.user
        );
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
