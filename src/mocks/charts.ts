import { Chart } from 'reducers/charts/types';

export const SIMPLE_CHART: Chart = {
  version: 1,
  id: '1',
  createdAt: 1615976863997,
  updatedAt: 1615976865123,
  name: 'SampleChart',
  user: 'test@email.com',
  dateFrom: '2020-11-25T11:27:46.493Z',
  dateTo: '2020-11-25T11:27:46.493Z',
};

export const CHARTS: Chart[] = [SIMPLE_CHART];
