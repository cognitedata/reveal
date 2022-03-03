import { v4 as uuidv4 } from 'uuid';
import { Chart, ChartTimeSeries, ChartWorkflow } from './types';
import {
  addTimeseries,
  addWorkflow,
  duplicate,
  removeTimeseries,
  removeWorkflow,
  updateChartDateRange,
  updateSourceAxisForChart,
  updateTimeseries,
  updateWorkflow,
  updateWorkflowsToSupportVersions,
} from './updates';

describe('charts util', () => {
  const id = uuidv4();
  const chart: Chart = {
    id,
    version: 1,
    name: 'test chart',
    user: 'user_1@example.org',
    updatedAt: 1615976865123,
    createdAt: 1615976863997,
    public: true,
    dateFrom: 'then',
    dateTo: 'now',
  };
  describe('duplicate', () => {
    it('should update the appropriate fields', () => {
      expect(
        duplicate(chart, { email: 'user_2@example.org', id: '12345' }).public
      ).toBe(false);
      expect(
        duplicate(chart, { email: 'user_2@example.org', id: '12345' }).user
      ).toEqual('12345');
      expect(
        duplicate(chart, { email: 'user_2@example.org', id: '12345' }).name
      ).toEqual('test chart Copy');
      expect(
        duplicate(chart, { email: 'user_2@example.org', id: '12345' }).id
      ).not.toEqual(id);
      expect(
        duplicate(chart, { email: 'user_2@example.org', id: '12345' }).createdAt
      ).not.toEqual(chart.createdAt);
      expect(
        duplicate(chart, { email: 'user_2@example.org', id: '12345' }).updatedAt
      ).not.toEqual(chart.updatedAt);
    });
    it('should not update the other fields', () => {
      expect(
        duplicate(chart, { email: 'user_2@example.org', id: '12345' }).dateFrom
      ).toEqual('then');
      expect(
        duplicate(chart, { email: 'user_2@example.org', id: '12345' }).dateTo
      ).toEqual('now');
      expect(
        duplicate(chart, { email: 'user_2@example.org', id: '12345' }).version
      ).toEqual(1);
    });
  });
  describe('ChartTimerseries functions', () => {
    const ts: ChartTimeSeries = {
      id: '42',
      name: 'ts1',
      color: 'red',
      enabled: true,
      tsId: 42,
      type: 'timeseries',
      createdAt: 0,
    };
    const chartWithTS: Chart = {
      ...chart,
      timeSeriesCollection: [ts],
      sourceCollection: [{ id: ts.id, type: 'timeseries' }],
    };
    describe('updateTimeseries', () => {
      it('should do nothing for unknown ts', () => {
        expect(updateTimeseries(chart, 'foo', { color: 'red' })).toEqual(chart);
        expect(
          updateTimeseries(
            {
              ...chart,
              timeSeriesCollection: [],
            },
            '42',
            { color: 'red' }
          )
        ).toEqual({
          ...chart,
          timeSeriesCollection: [],
        });
      });
      it('should update existing ts', () => {
        expect(
          updateTimeseries(chartWithTS, '42', { color: 'blue', enabled: false })
        ).toEqual({
          ...chart,
          timeSeriesCollection: [
            {
              ...ts,
              enabled: false,
              color: 'blue',
            },
          ],
          sourceCollection: [{ id: '42', type: 'timeseries' }],
        });
      });
    });
    describe('removeTimeseries', () => {
      it('should remove time series, if found', () => {
        expect(removeTimeseries(chartWithTS, '42')).toEqual({
          ...chart,
          timeSeriesCollection: [],
          sourceCollection: [],
        });
      });
      it('should remove return an unchanged chart for unknown ids', () => {
        expect(removeTimeseries(chartWithTS, '44')).toEqual(chartWithTS);
      });
    });
    describe('addTimeseries', () => {
      it('should add timeseries to charts', () => {
        expect(addTimeseries(chart, ts)).toEqual(chartWithTS);
      });
    });
  });

  describe('ChartWorkflow functions', () => {
    const wf: ChartWorkflow = {
      id: '42',
      name: 'ts1',
      color: 'red',
      type: 'workflow',
      enabled: true,
    };
    const chartWithWF: Chart = {
      ...chart,
      workflowCollection: [wf],
      sourceCollection: [{ id: wf.id, type: 'workflow' }],
    };
    describe('updateWorkflow', () => {
      it('should do nothing for unknown wf', () => {
        expect(updateWorkflow(chart, 'foo', { color: 'red' })).toEqual(chart);
        expect(
          updateWorkflow(
            {
              ...chart,
              workflowCollection: [],
            },
            '42',
            { color: 'red' }
          )
        ).toEqual({
          ...chart,
          workflowCollection: [],
        });
      });
      it('should update existing ts', () => {
        expect(
          updateWorkflow(chartWithWF, '42', { color: 'blue', enabled: false })
        ).toEqual({
          ...chart,
          workflowCollection: [
            {
              ...wf,
              enabled: false,
              color: 'blue',
            },
          ],
          sourceCollection: [{ id: '42', type: 'workflow' }],
        });
      });
    });
    describe('removeWorkflow', () => {
      it('should remove time series, if found', () => {
        expect(removeWorkflow(chartWithWF, '42')).toEqual({
          ...chart,
          workflowCollection: [],
          sourceCollection: [],
        });
      });
      it('should remove return an unchanged chart for unknown ids', () => {
        expect(removeWorkflow(chartWithWF, '44')).toEqual(chartWithWF);
      });
    });
    describe('addWorkflow', () => {
      it('should add timeseries to charts', () => {
        expect(addWorkflow(chart, wf)).toEqual(chartWithWF);
      });
    });
  });

  describe('updateChartDateRange', () => {
    it('should update correctly when dates are in chronological order', () => {
      const existingChart: Chart = {
        id,
        version: 1,
        name: 'test chart',
        user: 'user_1@example.org',
        updatedAt: 1615976865123,
        createdAt: 1615976863997,
        public: true,
        dateFrom: '2021-12-13T12:00:00.000Z',
        dateTo: '2021-12-13T15:00:00.000Z',
      };

      const requestedDateFrom = '2021-12-13T16:00:00.000Z';
      const requestedDateTo = '2021-12-13T19:00:00.000Z';

      const updatedChart = updateChartDateRange(
        existingChart,
        requestedDateFrom,
        requestedDateTo
      );

      expect(updatedChart).toEqual({
        id,
        version: 1,
        name: 'test chart',
        user: 'user_1@example.org',
        updatedAt: 1615976865123,
        createdAt: 1615976863997,
        public: true,
        dateFrom: '2021-12-13T16:00:00.000Z',
        dateTo: '2021-12-13T19:00:00.000Z',
      });
    });

    it('should update correctly when dates are in reverse chronological order', () => {
      const existingChart: Chart = {
        id,
        version: 1,
        name: 'test chart',
        user: 'user_1@example.org',
        updatedAt: 1615976865123,
        createdAt: 1615976863997,
        public: true,
        dateFrom: '2021-12-13T12:00:00.000Z',
        dateTo: '2021-12-13T15:00:00.000Z',
      };

      const requestedDateFrom = '2021-12-13T19:00:00.000Z';
      const requestedDateTo = '2021-12-13T16:00:00.000Z';

      const updatedChart = updateChartDateRange(
        existingChart,
        requestedDateFrom,
        requestedDateTo
      );

      expect(updatedChart).toEqual({
        id,
        version: 1,
        name: 'test chart',
        user: 'user_1@example.org',
        updatedAt: 1615976865123,
        createdAt: 1615976863997,
        public: true,
        dateFrom: '2021-12-13T16:00:00.000Z',
        dateTo: '2021-12-13T19:00:00.000Z',
      });
    });
  });

  describe('updateSourceAxisForChart', () => {
    it('should update y axis correctly (1)', () => {
      const existingChart: Chart = {
        id,
        version: 1,
        name: 'test chart',
        user: 'user_1@example.org',
        updatedAt: 1615976865123,
        createdAt: 1615976863997,
        public: true,
        dateFrom: '2021-12-13T12:00:00.000Z',
        dateTo: '2021-12-13T15:00:00.000Z',
        timeSeriesCollection: [
          {
            id: 'ts-1',
            name: 'ts-1',
            tsId: 1,
            color: 'red',
            enabled: true,
            createdAt: 1000,
          },
          {
            id: 'ts-2',
            name: 'ts-2',
            tsId: 2,
            color: 'red',
            enabled: true,
            createdAt: 1000,
          },
        ],
      };

      const updatedChart = updateSourceAxisForChart(existingChart, {
        x: ['2021-12-24T12:00:00.000Z', '2021-12-24T14:00:00.000Z'],
        y: [
          { type: 'timeseries', id: 'ts-1', range: [0, 1] },
          { type: 'timeseries', id: 'ts-2', range: [2, 4] },
        ],
      });

      expect(updatedChart).toEqual({
        id,
        version: 1,
        name: 'test chart',
        user: 'user_1@example.org',
        updatedAt: 1615976865123,
        createdAt: 1615976863997,
        public: true,
        dateFrom: '2021-12-24T12:00:00.000Z',
        dateTo: '2021-12-24T14:00:00.000Z',
        timeSeriesCollection: [
          {
            id: 'ts-1',
            name: 'ts-1',
            tsId: 1,
            color: 'red',
            enabled: true,
            createdAt: 1000,
            range: [0, 1],
          },
          {
            id: 'ts-2',
            name: 'ts-2',
            tsId: 2,
            color: 'red',
            enabled: true,
            createdAt: 1000,
            range: [2, 4],
          },
        ],
      });
    });

    it('should update y axis correctly (2)', () => {
      const existingChart: Chart = {
        id,
        version: 1,
        name: 'test chart',
        user: 'user_1@example.org',
        updatedAt: 1615976865123,
        createdAt: 1615976863997,
        public: true,
        dateFrom: '2021-12-13T12:00:00.000Z',
        dateTo: '2021-12-13T15:00:00.000Z',
        timeSeriesCollection: [
          {
            id: 'ts-1',
            name: 'ts-1',
            tsId: 1,
            color: 'red',
            enabled: true,
            createdAt: 1000,
            range: [0, 0],
          },
          {
            id: 'ts-2',
            name: 'ts-2',
            tsId: 2,
            color: 'red',
            enabled: true,
            createdAt: 1000,
            range: [0, 0],
          },
        ],
      };

      const updatedChart = updateSourceAxisForChart(existingChart, {
        x: ['2021-12-24T12:00:00.000Z', '2021-12-24T14:00:00.000Z'],
        y: [
          { type: 'timeseries', id: 'ts-1', range: [0, 1] },
          { type: 'timeseries', id: 'ts-2', range: [2, 4] },
        ],
      });

      expect(updatedChart).toEqual({
        id,
        version: 1,
        name: 'test chart',
        user: 'user_1@example.org',
        updatedAt: 1615976865123,
        createdAt: 1615976863997,
        public: true,
        dateFrom: '2021-12-24T12:00:00.000Z',
        dateTo: '2021-12-24T14:00:00.000Z',
        timeSeriesCollection: [
          {
            id: 'ts-1',
            name: 'ts-1',
            tsId: 1,
            color: 'red',
            enabled: true,
            createdAt: 1000,
            range: [0, 1],
          },
          {
            id: 'ts-2',
            name: 'ts-2',
            tsId: 2,
            color: 'red',
            enabled: true,
            createdAt: 1000,
            range: [2, 4],
          },
        ],
      });
    });
  });

  describe('updateWorkflowsToSupportVersions', () => {
    it('should update the versioning of an older chart to the new defaults / format', () => {
      const existingChart: Chart = {
        dateTo: '2022-03-01T22:59:53.815Z',
        public: false,
        workflowCollection: [
          {
            unit: '',
            createdAt: 1646140229019,
            enabled: true,
            lineWeight: 1,
            version: 'v2',
            calls: [],
            flow: {
              position: [0, 0],
              elements: [
                {
                  id: '83af5d6e-69b7-4959-b56a-0c97049dc523',
                  position: {
                    x: 560,
                    y: 117,
                  },
                  type: 'CalculationOutput',
                },
                {
                  id: '9dc972a2-a78e-46d9-bf51-84ccabc52109',
                  data: {
                    type: 'timeseries',
                    selectedSourceId: '51f11e0f-f893-48b4-bfb5-fd213d2541c5',
                  },
                  type: 'CalculationInput',
                  position: {
                    y: 121,
                    x: 4,
                  },
                },
                {
                  id: 'b3a2e403-b028-493b-b142-b9d3ca58b917a',
                  type: 'ToolboxFunction',
                  data: {
                    parameterValues: {
                      wavelet: 'db8',
                      level: 2,
                    },
                    selectedOperation: {
                      op: 'wavelet_filter',
                    },
                  },
                  position: {
                    y: 134,
                    x: 314,
                  },
                },
                {
                  id: 'b3a2e403-b028-493b-b142-b9d3ca58b917b',
                  type: 'ToolboxFunction',
                  data: {
                    parameterValues: {
                      wavelet: 'db8',
                      level: 2,
                    },
                    selectedOperation: {
                      op: 'wavelet_filter',
                      version: '0.0',
                    },
                  },
                  position: {
                    y: 134,
                    x: 314,
                  },
                },
                {
                  id: 'b3a2e403-b028-493b-b142-b9d3ca58b917c',
                  type: 'ToolboxFunction',
                  data: {
                    parameterValues: {
                      wavelet: 'db8',
                      level: 2,
                    },
                    selectedOperation: {
                      op: 'wavelet_filter',
                      version: '1.0',
                    },
                  },
                  position: {
                    y: 134,
                    x: 314,
                  },
                },
                {
                  id: 'b3a2e403-b028-493b-b142-b9d3ca58b917d',
                  type: 'ToolboxFunction',
                  data: {
                    parameterValues: {
                      wavelet: 'db8',
                      level: 2,
                    },
                    selectedOperation: {
                      op: 'wavelet_filter',
                      version: '2.0',
                    },
                  },
                  position: {
                    y: 134,
                    x: 314,
                  },
                },
                {
                  id: 'b3a2e403-b028-493b-b142-b9d3ca58b917d',
                  type: 'ToolboxFunction',
                  data: {
                    functionData: {
                      wavelet: 'db8',
                      level: 2,
                    },
                    toolFunction: {
                      op: 'wavelet_filter',
                    },
                    parameterValues: {
                      wavelet: 'db2',
                      level: 4,
                    },
                    selectedOperation: {
                      op: 'wavelet_filter',
                      version: '2.0',
                    },
                  },
                  position: {
                    y: 134,
                    x: 314,
                  },
                },
                {
                  id: 'b3a2e403-b028-493b-b142-b9d3ca58b917d',
                  type: 'ToolboxFunction',
                  data: {
                    functionData: {
                      wavelet: 'db8',
                      level: 2,
                    },
                    toolFunction: {
                      op: 'wavelet_filter',
                    },
                  },
                  position: {
                    y: 134,
                    x: 314,
                  },
                },
              ],
              zoom: 1,
            },
            type: 'workflow',
            lineStyle: 'solid',
            settings: {
              autoAlign: true,
            },
            id: '604e1d7f-3c5c-4a51-800a-ba6d6a0311cd',
            preferredUnit: '',
            color: '#6929c4',
            name: 'New Calculation',
          },
        ],
        updatedAt: 1646140273831,
        name: 'New chart',
        timeSeriesCollection: [],
        dateFrom: '2022-01-29T23:00:53.815Z',
        userInfo: {
          email: 'eirik.vullum@cognite.com',
          id: 'eirik.vullum@cognite.com',
          displayName: 'eirik.vullum@cognite.com',
        },
        createdAt: 1646140193815,
        version: 1,
        user: 'eirik.vullum@cognite.com',
        id: 'a8688ac6-c87a-4dd4-a4c6-a4b13fffe200',
        sourceCollection: [],
        settings: {
          showMinMax: false,
          showYAxis: true,
          showGridlines: true,
          mergeUnits: false,
        },
      };

      const updatedChart = updateWorkflowsToSupportVersions(existingChart);

      expect(updatedChart).toEqual({
        dateTo: '2022-03-01T22:59:53.815Z',
        public: false,
        workflowCollection: [
          {
            unit: '',
            createdAt: 1646140229019,
            enabled: true,
            lineWeight: 1,
            version: 'v2',
            calls: [],
            flow: {
              position: [0, 0],
              elements: [
                {
                  id: '83af5d6e-69b7-4959-b56a-0c97049dc523',
                  position: {
                    x: 560,
                    y: 117,
                  },
                  type: 'CalculationOutput',
                },
                {
                  id: '9dc972a2-a78e-46d9-bf51-84ccabc52109',
                  data: {
                    type: 'timeseries',
                    selectedSourceId: '51f11e0f-f893-48b4-bfb5-fd213d2541c5',
                  },
                  type: 'CalculationInput',
                  position: {
                    y: 121,
                    x: 4,
                  },
                },
                {
                  id: 'b3a2e403-b028-493b-b142-b9d3ca58b917a',
                  type: 'ToolboxFunction',
                  data: {
                    parameterValues: {
                      wavelet: 'db8',
                      level: 2,
                    },
                    selectedOperation: {
                      op: 'wavelet_filter',
                      version: '',
                    },
                  },
                  position: {
                    y: 134,
                    x: 314,
                  },
                },
                {
                  id: 'b3a2e403-b028-493b-b142-b9d3ca58b917b',
                  type: 'ToolboxFunction',
                  data: {
                    parameterValues: {
                      wavelet: 'db8',
                      level: 2,
                    },
                    selectedOperation: {
                      op: 'wavelet_filter',
                      version: '1.0',
                    },
                  },
                  position: {
                    y: 134,
                    x: 314,
                  },
                },
                {
                  id: 'b3a2e403-b028-493b-b142-b9d3ca58b917c',
                  type: 'ToolboxFunction',
                  data: {
                    parameterValues: {
                      wavelet: 'db8',
                      level: 2,
                    },
                    selectedOperation: {
                      op: 'wavelet_filter',
                      version: '1.0',
                    },
                  },
                  position: {
                    y: 134,
                    x: 314,
                  },
                },
                {
                  id: 'b3a2e403-b028-493b-b142-b9d3ca58b917d',
                  type: 'ToolboxFunction',
                  data: {
                    parameterValues: {
                      wavelet: 'db8',
                      level: 2,
                    },
                    selectedOperation: {
                      op: 'wavelet_filter',
                      version: '2.0',
                    },
                  },
                  position: {
                    y: 134,
                    x: 314,
                  },
                },
                {
                  id: 'b3a2e403-b028-493b-b142-b9d3ca58b917d',
                  type: 'ToolboxFunction',
                  data: {
                    functionData: {
                      wavelet: 'db8',
                      level: 2,
                    },
                    toolFunction: {
                      op: 'wavelet_filter',
                    },
                    parameterValues: {
                      wavelet: 'db2',
                      level: 4,
                    },
                    selectedOperation: {
                      op: 'wavelet_filter',
                      version: '2.0',
                    },
                  },
                  position: {
                    y: 134,
                    x: 314,
                  },
                },
                {
                  id: 'b3a2e403-b028-493b-b142-b9d3ca58b917d',
                  type: 'ToolboxFunction',
                  data: {
                    functionData: {
                      wavelet: 'db8',
                      level: 2,
                    },
                    toolFunction: {
                      op: 'wavelet_filter',
                    },
                    selectedOperation: {
                      op: 'wavelet_filter',
                      version: '',
                    },
                    parameterValues: {
                      wavelet: 'db8',
                      level: 2,
                    },
                  },
                  position: {
                    y: 134,
                    x: 314,
                  },
                },
              ],
              zoom: 1,
            },
            type: 'workflow',
            lineStyle: 'solid',
            settings: {
              autoAlign: true,
            },
            id: '604e1d7f-3c5c-4a51-800a-ba6d6a0311cd',
            preferredUnit: '',
            color: '#6929c4',
            name: 'New Calculation',
          },
        ],
        updatedAt: 1646140273831,
        name: 'New chart',
        timeSeriesCollection: [],
        dateFrom: '2022-01-29T23:00:53.815Z',
        userInfo: {
          email: 'eirik.vullum@cognite.com',
          id: 'eirik.vullum@cognite.com',
          displayName: 'eirik.vullum@cognite.com',
        },
        createdAt: 1646140193815,
        version: 1,
        user: 'eirik.vullum@cognite.com',
        id: 'a8688ac6-c87a-4dd4-a4c6-a4b13fffe200',
        sourceCollection: [],
        settings: {
          showMinMax: false,
          showYAxis: true,
          showGridlines: true,
          mergeUnits: false,
        },
      });
    });
  });
});
