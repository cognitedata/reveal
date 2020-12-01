import { Chart, ChartState } from 'reducers/charts';

export const SIMPLE_CHART: Chart = {
  id: '1',
  name: 'SampleChart',
  user: 'test@cognite-test.com',
  dateFrom: '2020-11-25T11:27:46.493Z',
  dateTo: '2020-11-25T11:27:46.493Z',
};

export const CHARTS: Chart[] = [SIMPLE_CHART];

export const CHARTS_STATE: ChartState = {
  ids: ['1'],
  entities: { '1': SIMPLE_CHART },
  status: {
    status: 'SUCCESS',
  },
  initialized: true,
};
