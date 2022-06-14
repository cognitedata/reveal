import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { Chart } from 'models/chart/types';
import { uniqBy } from 'lodash';

const charts = (project: string) => {
  return firebase
    .firestore()
    .collection('tenants')
    .doc(project)
    .collection('charts');
};

export const fetchPublicCharts = async (projectId: string) => {
  const snapshot = await charts(projectId)
    .where('version', '==', 1)
    .where('public', '==', true)
    .get();
  return snapshot.docs.map((doc) => doc.data()) as Chart[];
};

export const fetchUserCharts = async (
  projectId: string,
  userId: string,
  userEmail?: string
) => {
  const chartsWhereUserMatchesId = (
    await charts(projectId)
      .where('version', '==', 1)
      .where('user', '==', userId)
      .get()
  ).docs.map((doc) => doc.data()) as Chart[];

  let chartsWhereUserMatchesEmail: Chart[];

  try {
    chartsWhereUserMatchesEmail = !userEmail
      ? []
      : ((
          await charts(projectId)
            .where('version', '==', 1)
            .where('user', '==', userEmail)
            .get()
        ).docs.map((doc) => doc.data()) as Chart[]);
  } catch (err) {
    chartsWhereUserMatchesEmail = [];
  }

  const userCharts = uniqBy(
    [...chartsWhereUserMatchesId, ...chartsWhereUserMatchesEmail],
    'id'
  );

  return userCharts;
};

export const fetchChart = async (projectId: string, chartId: string) => {
  return (await charts(projectId).doc(chartId).get()).data() as Chart;
};

export const deleteChart = async (projectId: string, chartId: string) => {
  return charts(projectId).doc(chartId).delete();
};

export const updateChart = async (
  projectId: string,
  chartId: string,
  content: Partial<Chart>
) => {
  return charts(projectId).doc(chartId).set(content, { merge: true });
};

export const createChart = updateChart;
