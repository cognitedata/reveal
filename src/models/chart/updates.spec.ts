import { fullListOfOperations } from 'models/operations/mocks';
import { v4 as uuidv4 } from 'uuid';
import { Chart, ChartTimeSeries, ChartWorkflow, ChartThreshold } from './types';
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
  updateWorkflowsFromV1toV2,
  updateWorkflowsToSupportVersions,
  addChartThreshold,
  removeChartThreshold,
  updateChartThresholdEventFilters,
  updateChartThresholdLowerLimit,
  updateChartThresholdName,
  updateChartThresholdSelectedSource,
  updateChartThresholdType,
  updateChartThresholdUpperLimit,
  updateChartThresholdVisibility,
  updateChartThresholdProperties,
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
      version: 'v2',
      settings: {
        autoAlign: true,
      },
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
                      version: '1.0',
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
                      version: '1.0',
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

  describe('updateWorkflowsFromV1toV2', () => {
    it('should update old workflows using @cognite/connect to new format used by react-flow', () => {
      const existingChart: Chart = {
        user: 'eirik.vullum@cognite.com',
        sourceCollection: [
          {
            type: 'workflow',
            id: '7effb0fc-dcf7-4a37-8dc9-b4db561082e8',
          },
          {
            id: '77e94c4b-f530-4d1e-a026-be174f0f55bd',
            type: 'timeseries',
          },
          {
            id: 'e050378a-42e0-4a7e-b0c2-7ad1f2512f78',
            type: 'timeseries',
          },
        ],
        createdAt: 1646217027249,
        updatedAt: 1646222737770,
        dateFrom: '2022-01-30T23:00:27.249Z',
        userInfo: {
          email: 'eirik.vullum@cognite.com',
          displayName: 'eirik.vullum@cognite.com',
          id: 'eirik.vullum@cognite.com',
        },
        version: 1,
        timeSeriesCollection: [
          {
            displayMode: 'lines',
            range: [0.00226, 0.00307],
            lineStyle: 'solid',
            type: 'timeseries',
            originalUnit: '',
            description: '-',
            tsExternalId: 'VAL_21_PI_1019_04:Z.X.Value',
            color: '#6929c4',
            id: 'e050378a-42e0-4a7e-b0c2-7ad1f2512f78',
            unit: '',
            createdAt: 1646217030922,
            enabled: true,
            lineWeight: 1,
            tsId: 7659541038688891,
            preferredUnit: '',
            name: 'VAL_21_PI_1019_04:Z.X.Value',
          },
          {
            preferredUnit: '',
            lineWeight: 1,
            range: [0.00226, 0.00306],
            lineStyle: 'solid',
            displayMode: 'lines',
            originalUnit: '',
            createdAt: 1646217032056,
            tsId: 4470513466595936,
            color: '#1192e8',
            id: '77e94c4b-f530-4d1e-a026-be174f0f55bd',
            tsExternalId: 'VAL_21_PT_1019_04:Z.X.Value',
            description: '-',
            unit: '',
            type: 'timeseries',
            name: 'VAL_21_PT_1019_04:Z.X.Value',
            enabled: true,
          },
        ],
        name: 'New chart',
        workflowCollection: [
          {
            lineWeight: 1,
            nodes: [
              {
                x: 11,
                inputPins: [],
                id: '006fe9d1-b815-4634-a0c3-266da87b3416',
                functionData: {
                  type: 'timeseries',
                  sourceId: 'VAL_21_PI_1019_04:Z.X.Value',
                },
                icon: 'Function',
                y: 112,
                calls: [],
                functionEffectReference: 'SOURCE_REFERENCE',
                width: 314.546875,
                outputPins: [
                  {
                    title: 'Time Series',
                    y: 132,
                    x: 325.546875,
                    id: 'result',
                    type: 'TIMESERIES',
                  },
                ],
                subtitle: 'Time Series',
                color: '#FC2574',
                selected: false,
                title: 'VAL_21_PI_1019_04:Z.X.Value',
              },
              {
                x: 11,
                inputPins: [],
                id: '006fe9d1-b815-4634-a0c3-266da87b3416-1',
                functionData: {
                  timeseriesExternalId: 'VAL_21_PI_1019_04:Z.X.Value',
                },
                icon: 'Function',
                y: 112,
                calls: [],
                functionEffectReference: 'TIME_SERIES_REFERENCE',
                width: 314.546875,
                outputPins: [
                  {
                    title: 'Time Series',
                    y: 132,
                    x: 325.546875,
                    id: 'result',
                    type: 'TIMESERIES',
                  },
                ],
                subtitle: 'Time Series',
                color: '#FC2574',
                selected: false,
                title: 'VAL_21_PI_1019_04:Z.X.Value',
              },
              {
                x: 11,
                inputPins: [],
                id: '006fe9d1-b815-4634-a0c3-266da87b3416-2',
                functionData: {
                  timeSeriesExternalId: 'VAL_21_PI_1019_04:Z.X.Value',
                },
                icon: 'Function',
                y: 112,
                calls: [],
                functionEffectReference: 'TIME_SERIES_REFERENCE',
                width: 314.546875,
                outputPins: [
                  {
                    title: 'Time Series',
                    y: 132,
                    x: 325.546875,
                    id: 'result',
                    type: 'TIMESERIES',
                  },
                ],
                subtitle: 'Time Series',
                color: '#FC2574',
                selected: false,
                title: 'VAL_21_PI_1019_04:Z.X.Value',
              },
              {
                selected: false,
                id: 'd0d8a17f-fddd-4569-be52-1ef8d7f87a3e',
                outputPins: [
                  {
                    x: 186.0625,
                    y: 245,
                    id: 'result',
                    type: 'TIMESERIES',
                    title: 'Time Series',
                  },
                ],
                x: 77,
                inputPins: [],
                subtitle: 'Time Series',
                width: 109.0625,
                calls: [],
                title: 'VAL_21_PT_1019_04:Z.X.Value',
                icon: 'Function',
                functionEffectReference: 'SOURCE_REFERENCE',
                functionData: {
                  type: 'timeseries',
                  sourceId: 'VAL_21_PT_1019_04:Z.X.Value',
                },
                color: '#FC2574',
                y: 225,
              },
              {
                id: '2031a26e-a5f3-4abf-81cf-f55f8f3db714',
                x: 96,
                subtitle: 'Constant',
                outputPins: [
                  {
                    type: 'CONSTANT',
                    title: 'Constant',
                    x: 230.046875,
                    id: 'result',
                    y: 352,
                  },
                ],
                title: 'Constant',
                inputPins: [],
                selected: false,
                width: 134.046875,
                functionData: {
                  value: 20,
                },
                functionEffectReference: 'CONSTANT',
                icon: 'Function',
                color: '#FC2574',
                calls: [],
                y: 332,
              },
              {
                color: '#9118af',
                inputPins: [
                  {
                    x: 448,
                    id: 'a',
                    types: ['TIMESERIES', 'CONSTANT'],
                    y: 95,
                    title: 'Time-series or number.',
                  },
                  {
                    types: ['TIMESERIES', 'CONSTANT'],
                    id: 'b',
                    title: 'Time-series or number.',
                    x: 448,
                    y: 127,
                  },
                ],
                calls: [],
                icon: 'Function',
                x: 448,
                functionEffectReference: 'TOOLBOX_FUNCTION',
                subtitle: 'Function',
                width: 294,
                y: 33,
                functionData: {
                  toolFunction: {
                    op: 'ADD',
                    version: '1.0',
                  },
                },
                outputPins: [
                  {
                    title: 'time series',
                    type: 'TIMESERIES',
                    id: 'out-result',
                    x: 742,
                    y: 95,
                  },
                ],
                title: 'Add',
                selected: false,
                id: '284f5de8-a127-4be7-a1f2-716b5107b110',
              },
              {
                selected: false,
                outputPins: [
                  {
                    id: 'out-result',
                    type: 'TIMESERIES',
                    x: 1089,
                    y: 408,
                    title: 'time series',
                  },
                ],
                calls: [],
                inputPins: [
                  {
                    types: ['TIMESERIES', 'CONSTANT'],
                    id: 'a',
                    y: 408,
                    x: 795,
                    title: 'Time-series or number.',
                  },
                  {
                    id: 'b',
                    x: 795,
                    y: 440,
                    title: 'Time-series or number.',
                    types: ['TIMESERIES', 'CONSTANT'],
                  },
                ],
                color: '#9118af',
                title: 'Subtraction',
                id: 'f8422bf0-2517-40a3-a999-8f750ea8c961',
                functionEffectReference: 'TOOLBOX_FUNCTION',
                functionData: {
                  toolFunction: {
                    op: 'sub',
                    version: '1.0',
                  },
                },
                x: 795,
                icon: 'Function',
                subtitle: 'Function',
                y: 346,
                width: 294,
              },
              {
                x: 1128,
                selected: false,
                color: '#4A67FB',
                y: 128,
                outputPins: [],
                subtitle: 'CHART OUTPUT',
                id: '6e6eea91-5739-4dfb-ad09-e1e26a5847a0',
                calls: [],
                width: 162,
                functionEffectReference: 'OUTPUT',
                icon: 'Icon',
                title: 'Output',
                inputPins: [
                  {
                    types: ['TIMESERIES'],
                    x: 1128,
                    id: 'datapoints',
                    title: 'Time Series',
                    y: 190,
                  },
                ],
              },
            ],
            connections: {
              Itjm1x9uLqvoxCv3AG9oo: {
                id: 'Itjm1x9uLqvoxCv3AG9oo',
                outputPin: {
                  pinId: 'result',
                  nodeId: 'd0d8a17f-fddd-4569-be52-1ef8d7f87a3e',
                },
                inputPin: {
                  pinId: 'b',
                  nodeId: '284f5de8-a127-4be7-a1f2-716b5107b110',
                },
              },
              '3EihQBpDy9ex-Uu5gcUxm': {
                id: '3EihQBpDy9ex-Uu5gcUxm',
                inputPin: {
                  pinId: 'datapoints',
                  nodeId: '6e6eea91-5739-4dfb-ad09-e1e26a5847a0',
                },
                outputPin: {
                  nodeId: 'f8422bf0-2517-40a3-a999-8f750ea8c961',
                  pinId: 'out-result',
                },
              },
              sDutG1B9JRZzsH6wW_uny: {
                outputPin: {
                  nodeId: '284f5de8-a127-4be7-a1f2-716b5107b110',
                  pinId: 'out-result',
                },
                id: 'sDutG1B9JRZzsH6wW_uny',
                inputPin: {
                  nodeId: 'f8422bf0-2517-40a3-a999-8f750ea8c961',
                  pinId: 'a',
                },
              },
              YlGYZfugwQ9Y2c0xev87X: {
                inputPin: {
                  nodeId: 'f8422bf0-2517-40a3-a999-8f750ea8c961',
                  pinId: 'b',
                },
                id: 'YlGYZfugwQ9Y2c0xev87X',
                outputPin: {
                  pinId: 'result',
                  nodeId: '2031a26e-a5f3-4abf-81cf-f55f8f3db714',
                },
              },
              nsIftsG_IkdW8Czc88VW9: {
                id: 'nsIftsG_IkdW8Czc88VW9',
                outputPin: {
                  nodeId: '006fe9d1-b815-4634-a0c3-266da87b3416',
                  pinId: 'result',
                },
                inputPin: {
                  pinId: 'a',
                  nodeId: '284f5de8-a127-4be7-a1f2-716b5107b110',
                },
              },
            },
            createdAt: 1646222615398,
            type: 'workflow',
            color: '#012749',
            version: '',
            preferredUnit: '',
            unit: '',
            name: 'New Calculation',
            calls: [],
            lineStyle: 'solid',
            id: '7effb0fc-dcf7-4a37-8dc9-b4db561082e8',
            enabled: true,
          },
        ],
        settings: {
          showMinMax: false,
          mergeUnits: false,
          showGridlines: true,
          showYAxis: true,
        },
        dateTo: '2022-03-02T22:59:27.249Z',
        id: '8e0342c5-dd24-42b8-9b9d-a71ff86ced9d',
        public: false,
      };

      const updatedChart = updateWorkflowsFromV1toV2(
        existingChart,
        fullListOfOperations
      );

      expect(updatedChart).toEqual({
        user: 'eirik.vullum@cognite.com',
        sourceCollection: [
          {
            type: 'workflow',
            id: '7effb0fc-dcf7-4a37-8dc9-b4db561082e8',
          },
          {
            id: '77e94c4b-f530-4d1e-a026-be174f0f55bd',
            type: 'timeseries',
          },
          {
            id: 'e050378a-42e0-4a7e-b0c2-7ad1f2512f78',
            type: 'timeseries',
          },
        ],
        createdAt: 1646217027249,
        updatedAt: 1646222737770,
        dateFrom: '2022-01-30T23:00:27.249Z',
        userInfo: {
          email: 'eirik.vullum@cognite.com',
          displayName: 'eirik.vullum@cognite.com',
          id: 'eirik.vullum@cognite.com',
        },
        version: 1,
        timeSeriesCollection: [
          {
            displayMode: 'lines',
            range: [0.00226, 0.00307],
            lineStyle: 'solid',
            type: 'timeseries',
            originalUnit: '',
            description: '-',
            tsExternalId: 'VAL_21_PI_1019_04:Z.X.Value',
            color: '#6929c4',
            id: 'e050378a-42e0-4a7e-b0c2-7ad1f2512f78',
            unit: '',
            createdAt: 1646217030922,
            enabled: true,
            lineWeight: 1,
            tsId: 7659541038688891,
            preferredUnit: '',
            name: 'VAL_21_PI_1019_04:Z.X.Value',
          },
          {
            preferredUnit: '',
            lineWeight: 1,
            range: [0.00226, 0.00306],
            lineStyle: 'solid',
            displayMode: 'lines',
            originalUnit: '',
            createdAt: 1646217032056,
            tsId: 4470513466595936,
            color: '#1192e8',
            id: '77e94c4b-f530-4d1e-a026-be174f0f55bd',
            tsExternalId: 'VAL_21_PT_1019_04:Z.X.Value',
            description: '-',
            unit: '',
            type: 'timeseries',
            name: 'VAL_21_PT_1019_04:Z.X.Value',
            enabled: true,
          },
        ],
        name: 'New chart',
        workflowCollection: [
          {
            lineWeight: 1,
            nodes: [
              {
                x: 11,
                inputPins: [],
                id: '006fe9d1-b815-4634-a0c3-266da87b3416',
                functionData: {
                  type: 'timeseries',
                  sourceId: 'VAL_21_PI_1019_04:Z.X.Value',
                },
                icon: 'Function',
                y: 112,
                calls: [],
                functionEffectReference: 'SOURCE_REFERENCE',
                width: 314.546875,
                outputPins: [
                  {
                    title: 'Time Series',
                    y: 132,
                    x: 325.546875,
                    id: 'result',
                    type: 'TIMESERIES',
                  },
                ],
                subtitle: 'Time Series',
                color: '#FC2574',
                selected: false,
                title: 'VAL_21_PI_1019_04:Z.X.Value',
              },
              {
                x: 11,
                inputPins: [],
                id: '006fe9d1-b815-4634-a0c3-266da87b3416-1',
                functionData: {
                  timeseriesExternalId: 'VAL_21_PI_1019_04:Z.X.Value',
                },
                icon: 'Function',
                y: 112,
                calls: [],
                functionEffectReference: 'TIME_SERIES_REFERENCE',
                width: 314.546875,
                outputPins: [
                  {
                    title: 'Time Series',
                    y: 132,
                    x: 325.546875,
                    id: 'result',
                    type: 'TIMESERIES',
                  },
                ],
                subtitle: 'Time Series',
                color: '#FC2574',
                selected: false,
                title: 'VAL_21_PI_1019_04:Z.X.Value',
              },
              {
                x: 11,
                inputPins: [],
                id: '006fe9d1-b815-4634-a0c3-266da87b3416-2',
                functionData: {
                  timeSeriesExternalId: 'VAL_21_PI_1019_04:Z.X.Value',
                },
                icon: 'Function',
                y: 112,
                calls: [],
                functionEffectReference: 'TIME_SERIES_REFERENCE',
                width: 314.546875,
                outputPins: [
                  {
                    title: 'Time Series',
                    y: 132,
                    x: 325.546875,
                    id: 'result',
                    type: 'TIMESERIES',
                  },
                ],
                subtitle: 'Time Series',
                color: '#FC2574',
                selected: false,
                title: 'VAL_21_PI_1019_04:Z.X.Value',
              },
              {
                selected: false,
                id: 'd0d8a17f-fddd-4569-be52-1ef8d7f87a3e',
                outputPins: [
                  {
                    x: 186.0625,
                    y: 245,
                    id: 'result',
                    type: 'TIMESERIES',
                    title: 'Time Series',
                  },
                ],
                x: 77,
                inputPins: [],
                subtitle: 'Time Series',
                width: 109.0625,
                calls: [],
                title: 'VAL_21_PT_1019_04:Z.X.Value',
                icon: 'Function',
                functionEffectReference: 'SOURCE_REFERENCE',
                functionData: {
                  type: 'timeseries',
                  sourceId: 'VAL_21_PT_1019_04:Z.X.Value',
                },
                color: '#FC2574',
                y: 225,
              },
              {
                id: '2031a26e-a5f3-4abf-81cf-f55f8f3db714',
                x: 96,
                subtitle: 'Constant',
                outputPins: [
                  {
                    type: 'CONSTANT',
                    title: 'Constant',
                    x: 230.046875,
                    id: 'result',
                    y: 352,
                  },
                ],
                title: 'Constant',
                inputPins: [],
                selected: false,
                width: 134.046875,
                functionData: {
                  value: 20,
                },
                functionEffectReference: 'CONSTANT',
                icon: 'Function',
                color: '#FC2574',
                calls: [],
                y: 332,
              },
              {
                color: '#9118af',
                inputPins: [
                  {
                    x: 448,
                    id: 'a',
                    types: ['TIMESERIES', 'CONSTANT'],
                    y: 95,
                    title: 'Time-series or number.',
                  },
                  {
                    types: ['TIMESERIES', 'CONSTANT'],
                    id: 'b',
                    title: 'Time-series or number.',
                    x: 448,
                    y: 127,
                  },
                ],
                calls: [],
                icon: 'Function',
                x: 448,
                functionEffectReference: 'TOOLBOX_FUNCTION',
                subtitle: 'Function',
                width: 294,
                y: 33,
                functionData: {
                  toolFunction: {
                    op: 'ADD',
                    version: '1.0',
                  },
                },
                outputPins: [
                  {
                    title: 'time series',
                    type: 'TIMESERIES',
                    id: 'out-result',
                    x: 742,
                    y: 95,
                  },
                ],
                title: 'Add',
                selected: false,
                id: '284f5de8-a127-4be7-a1f2-716b5107b110',
              },
              {
                selected: false,
                outputPins: [
                  {
                    id: 'out-result',
                    type: 'TIMESERIES',
                    x: 1089,
                    y: 408,
                    title: 'time series',
                  },
                ],
                calls: [],
                inputPins: [
                  {
                    types: ['TIMESERIES', 'CONSTANT'],
                    id: 'a',
                    y: 408,
                    x: 795,
                    title: 'Time-series or number.',
                  },
                  {
                    id: 'b',
                    x: 795,
                    y: 440,
                    title: 'Time-series or number.',
                    types: ['TIMESERIES', 'CONSTANT'],
                  },
                ],
                color: '#9118af',
                title: 'Subtraction',
                id: 'f8422bf0-2517-40a3-a999-8f750ea8c961',
                functionEffectReference: 'TOOLBOX_FUNCTION',
                functionData: {
                  toolFunction: {
                    op: 'sub',
                    version: '1.0',
                  },
                },
                x: 795,
                icon: 'Function',
                subtitle: 'Function',
                y: 346,
                width: 294,
              },
              {
                x: 1128,
                selected: false,
                color: '#4A67FB',
                y: 128,
                outputPins: [],
                subtitle: 'CHART OUTPUT',
                id: '6e6eea91-5739-4dfb-ad09-e1e26a5847a0',
                calls: [],
                width: 162,
                functionEffectReference: 'OUTPUT',
                icon: 'Icon',
                title: 'Output',
                inputPins: [
                  {
                    types: ['TIMESERIES'],
                    x: 1128,
                    id: 'datapoints',
                    title: 'Time Series',
                    y: 190,
                  },
                ],
              },
            ],
            connections: {
              Itjm1x9uLqvoxCv3AG9oo: {
                id: 'Itjm1x9uLqvoxCv3AG9oo',
                outputPin: {
                  pinId: 'result',
                  nodeId: 'd0d8a17f-fddd-4569-be52-1ef8d7f87a3e',
                },
                inputPin: {
                  pinId: 'b',
                  nodeId: '284f5de8-a127-4be7-a1f2-716b5107b110',
                },
              },
              '3EihQBpDy9ex-Uu5gcUxm': {
                id: '3EihQBpDy9ex-Uu5gcUxm',
                inputPin: {
                  pinId: 'datapoints',
                  nodeId: '6e6eea91-5739-4dfb-ad09-e1e26a5847a0',
                },
                outputPin: {
                  nodeId: 'f8422bf0-2517-40a3-a999-8f750ea8c961',
                  pinId: 'out-result',
                },
              },
              sDutG1B9JRZzsH6wW_uny: {
                outputPin: {
                  nodeId: '284f5de8-a127-4be7-a1f2-716b5107b110',
                  pinId: 'out-result',
                },
                id: 'sDutG1B9JRZzsH6wW_uny',
                inputPin: {
                  nodeId: 'f8422bf0-2517-40a3-a999-8f750ea8c961',
                  pinId: 'a',
                },
              },
              YlGYZfugwQ9Y2c0xev87X: {
                inputPin: {
                  nodeId: 'f8422bf0-2517-40a3-a999-8f750ea8c961',
                  pinId: 'b',
                },
                id: 'YlGYZfugwQ9Y2c0xev87X',
                outputPin: {
                  pinId: 'result',
                  nodeId: '2031a26e-a5f3-4abf-81cf-f55f8f3db714',
                },
              },
              nsIftsG_IkdW8Czc88VW9: {
                id: 'nsIftsG_IkdW8Czc88VW9',
                outputPin: {
                  nodeId: '006fe9d1-b815-4634-a0c3-266da87b3416',
                  pinId: 'result',
                },
                inputPin: {
                  pinId: 'a',
                  nodeId: '284f5de8-a127-4be7-a1f2-716b5107b110',
                },
              },
            },
            createdAt: 1646222615398,
            type: 'workflow',
            color: '#012749',
            version: 'v2',
            preferredUnit: '',
            unit: '',
            name: 'New Calculation',
            calls: [],
            lineStyle: 'solid',
            id: '7effb0fc-dcf7-4a37-8dc9-b4db561082e8',
            enabled: true,
            flow: {
              position: [0, 0],
              zoom: 1,
              elements: [
                {
                  id: 'Itjm1x9uLqvoxCv3AG9oo',
                  source: 'd0d8a17f-fddd-4569-be52-1ef8d7f87a3e',
                  sourceHandle: 'result',
                  target: '284f5de8-a127-4be7-a1f2-716b5107b110',
                  targetHandle: 'b',
                },
                {
                  id: '3EihQBpDy9ex-Uu5gcUxm',
                  source: 'f8422bf0-2517-40a3-a999-8f750ea8c961',
                  sourceHandle: 'out-result',
                  target: '6e6eea91-5739-4dfb-ad09-e1e26a5847a0',
                  targetHandle: 'datapoints',
                },
                {
                  id: 'sDutG1B9JRZzsH6wW_uny',
                  source: '284f5de8-a127-4be7-a1f2-716b5107b110',
                  sourceHandle: 'out-result',
                  target: 'f8422bf0-2517-40a3-a999-8f750ea8c961',
                  targetHandle: 'a',
                },
                {
                  id: 'YlGYZfugwQ9Y2c0xev87X',
                  source: '2031a26e-a5f3-4abf-81cf-f55f8f3db714',
                  sourceHandle: 'result',
                  target: 'f8422bf0-2517-40a3-a999-8f750ea8c961',
                  targetHandle: 'b',
                },
                {
                  id: 'nsIftsG_IkdW8Czc88VW9',
                  source: '006fe9d1-b815-4634-a0c3-266da87b3416',
                  sourceHandle: 'result',
                  target: '284f5de8-a127-4be7-a1f2-716b5107b110',
                  targetHandle: 'a',
                },
                {
                  id: '006fe9d1-b815-4634-a0c3-266da87b3416',
                  type: 'CalculationInput',
                  position: {
                    x: 11,
                    y: 112,
                  },
                  data: {
                    selectedSourceId: 'e050378a-42e0-4a7e-b0c2-7ad1f2512f78',
                    type: 'timeseries',
                  },
                },
                {
                  id: '006fe9d1-b815-4634-a0c3-266da87b3416-1',
                  type: 'CalculationInput',
                  position: {
                    x: 11,
                    y: 112,
                  },
                  data: {
                    selectedSourceId: 'e050378a-42e0-4a7e-b0c2-7ad1f2512f78',
                    type: 'timeseries',
                  },
                },
                {
                  id: '006fe9d1-b815-4634-a0c3-266da87b3416-2',
                  type: 'CalculationInput',
                  position: {
                    x: 11,
                    y: 112,
                  },
                  data: {
                    selectedSourceId: 'e050378a-42e0-4a7e-b0c2-7ad1f2512f78',
                    type: 'timeseries',
                  },
                },
                {
                  id: 'd0d8a17f-fddd-4569-be52-1ef8d7f87a3e',
                  type: 'CalculationInput',
                  position: {
                    x: 77,
                    y: 225,
                  },
                  data: {
                    selectedSourceId: '77e94c4b-f530-4d1e-a026-be174f0f55bd',
                    type: 'timeseries',
                  },
                },
                {
                  id: '2031a26e-a5f3-4abf-81cf-f55f8f3db714',
                  type: 'Constant',
                  position: {
                    x: 96,
                    y: 332,
                  },
                  data: {
                    value: 20,
                  },
                },
                {
                  id: '284f5de8-a127-4be7-a1f2-716b5107b110',
                  type: 'ToolboxFunction',
                  position: {
                    x: 448,
                    y: 33,
                  },
                  data: {
                    parameterValues: {},
                    selectedOperation: {
                      op: 'ADD',
                      version: '1.0',
                    },
                  },
                },
                {
                  id: 'f8422bf0-2517-40a3-a999-8f750ea8c961',
                  type: 'ToolboxFunction',
                  position: {
                    x: 795,
                    y: 346,
                  },
                  data: {
                    parameterValues: {},
                    selectedOperation: {
                      op: 'sub',
                      version: '1.0',
                    },
                  },
                },
                {
                  id: '6e6eea91-5739-4dfb-ad09-e1e26a5847a0',
                  type: 'CalculationOutput',
                  position: {
                    x: 1128,
                    y: 128,
                  },
                },
              ],
            },
            settings: {
              autoAlign: true,
            },
          },
        ],
        settings: {
          showMinMax: false,
          mergeUnits: false,
          showGridlines: true,
          showYAxis: true,
        },
        dateTo: '2022-03-02T22:59:27.249Z',
        id: '8e0342c5-dd24-42b8-9b9d-a71ff86ced9d',
        public: false,
      });
    });

    it('should update old workflows using @cognite/connect to new format used by react-flow (empty source and function nodes)', () => {
      const existingChart: Chart = {
        updatedAt: 1646222972666,
        dateTo: '2022-03-02T22:59:27.249Z',
        user: 'eirik.vullum@cognite.com',
        userInfo: {
          displayName: 'eirik.vullum@cognite.com',
          id: 'eirik.vullum@cognite.com',
          email: 'eirik.vullum@cognite.com',
        },
        sourceCollection: [
          {
            id: '1f358922-78a2-4547-8e99-f0e88e8f963b',
            type: 'workflow',
          },
          {
            id: '77e94c4b-f530-4d1e-a026-be174f0f55bd',
            type: 'timeseries',
          },
          {
            type: 'timeseries',
            id: 'e050378a-42e0-4a7e-b0c2-7ad1f2512f78',
          },
        ],
        createdAt: 1646217027249,
        timeSeriesCollection: [
          {
            name: 'VAL_21_PI_1019_04:Z.X.Value',
            type: 'timeseries',
            tsExternalId: 'VAL_21_PI_1019_04:Z.X.Value',
            preferredUnit: '',
            id: 'e050378a-42e0-4a7e-b0c2-7ad1f2512f78',
            originalUnit: '',
            enabled: true,
            color: '#6929c4',
            description: '-',
            lineStyle: 'solid',
            createdAt: 1646217030922,
            tsId: 7659541038688891,
            unit: '',
            lineWeight: 1,
            displayMode: 'lines',
            range: [0.00226, 0.00307],
          },
          {
            preferredUnit: '',
            tsExternalId: 'VAL_21_PT_1019_04:Z.X.Value',
            lineWeight: 1,
            lineStyle: 'solid',
            enabled: true,
            tsId: 4470513466595936,
            color: '#1192e8',
            unit: '',
            createdAt: 1646217032056,
            description: '-',
            originalUnit: '',
            id: '77e94c4b-f530-4d1e-a026-be174f0f55bd',
            type: 'timeseries',
            name: 'VAL_21_PT_1019_04:Z.X.Value',
            range: [0.00226, 0.00306],
            displayMode: 'lines',
          },
        ],
        settings: {
          showYAxis: true,
          mergeUnits: false,
          showMinMax: false,
          showGridlines: true,
        },
        dateFrom: '2022-01-30T23:00:27.249Z',
        name: 'New chart',
        public: false,
        workflowCollection: [
          {
            connections: [],
            lineWeight: 1,
            unit: '',
            calls: [],
            id: '1f358922-78a2-4547-8e99-f0e88e8f963b',
            enabled: true,
            type: 'workflow',
            createdAt: 1646222965115,
            name: 'New Calculation',
            preferredUnit: '',
            color: '#8a3800',
            lineStyle: 'solid',
            version: '',
            nodes: [
              {
                color: '#FC2574',
                functionEffectReference: 'SOURCE_REFERENCE',
                x: 142,
                id: 'ba550fc4-747a-489a-aafb-dcc89efb2282',
                icon: 'Function',
                outputPins: [
                  {
                    id: 'result',
                    type: 'TIMESERIES',
                    title: 'Time Series',
                  },
                ],
                inputPins: [],
                y: 113,
                title: 'Input',
                functionData: {
                  sourceId: '',
                  type: '',
                },
                calls: [],
                subtitle: 'Source',
              },
              {
                x: 148,
                outputPins: [
                  {
                    id: 'result',
                    title: 'Time Series',
                    type: 'TIMESERIES',
                  },
                ],
                id: '3c338e88-43ca-4771-b8ec-d5bcca9eb774',
                y: 269,
                subtitle: 'Source',
                icon: 'Function',
                functionData: {
                  type: '',
                  sourceId: '',
                },
                calls: [],
                title: 'Input',
                functionEffectReference: 'SOURCE_REFERENCE',
                inputPins: [],
                color: '#FC2574',
              },
              {
                icon: 'Function',
                subtitle: 'Function',
                inputPins: [],
                functionData: {
                  toolFunction: {},
                },
                y: 193,
                outputPins: [],
                color: '#9118af',
                title: 'Function',
                id: 'a1df3603-c907-471d-902a-ecced2cbb7f9',
                calls: [],
                functionEffectReference: 'TOOLBOX_FUNCTION',
                x: 483,
              },
              {
                outputPins: [],
                inputPins: [
                  {
                    types: ['TIMESERIES'],
                    id: 'datapoints',
                    title: 'Time Series',
                  },
                ],
                calls: [],
                x: 800,
                subtitle: 'CHART OUTPUT',
                y: 123,
                icon: 'Icon',
                title: 'Output',
                functionEffectReference: 'OUTPUT',
                id: '268b60f5-e5a6-46a2-ad9b-a7d0a58c3cb6',
                color: '#4A67FB',
              },
            ],
          },
        ],
        id: '8e0342c5-dd24-42b8-9b9d-a71ff86ced9d',
        version: 1,
      };

      const updatedChart = updateWorkflowsFromV1toV2(
        existingChart,
        fullListOfOperations
      );

      expect(updatedChart).toEqual({
        updatedAt: 1646222972666,
        dateTo: '2022-03-02T22:59:27.249Z',
        user: 'eirik.vullum@cognite.com',
        userInfo: {
          displayName: 'eirik.vullum@cognite.com',
          id: 'eirik.vullum@cognite.com',
          email: 'eirik.vullum@cognite.com',
        },
        sourceCollection: [
          {
            id: '1f358922-78a2-4547-8e99-f0e88e8f963b',
            type: 'workflow',
          },
          {
            id: '77e94c4b-f530-4d1e-a026-be174f0f55bd',
            type: 'timeseries',
          },
          {
            type: 'timeseries',
            id: 'e050378a-42e0-4a7e-b0c2-7ad1f2512f78',
          },
        ],
        createdAt: 1646217027249,
        timeSeriesCollection: [
          {
            name: 'VAL_21_PI_1019_04:Z.X.Value',
            type: 'timeseries',
            tsExternalId: 'VAL_21_PI_1019_04:Z.X.Value',
            preferredUnit: '',
            id: 'e050378a-42e0-4a7e-b0c2-7ad1f2512f78',
            originalUnit: '',
            enabled: true,
            color: '#6929c4',
            description: '-',
            lineStyle: 'solid',
            createdAt: 1646217030922,
            tsId: 7659541038688891,
            unit: '',
            lineWeight: 1,
            displayMode: 'lines',
            range: [0.00226, 0.00307],
          },
          {
            preferredUnit: '',
            tsExternalId: 'VAL_21_PT_1019_04:Z.X.Value',
            lineWeight: 1,
            lineStyle: 'solid',
            enabled: true,
            tsId: 4470513466595936,
            color: '#1192e8',
            unit: '',
            createdAt: 1646217032056,
            description: '-',
            originalUnit: '',
            id: '77e94c4b-f530-4d1e-a026-be174f0f55bd',
            type: 'timeseries',
            name: 'VAL_21_PT_1019_04:Z.X.Value',
            range: [0.00226, 0.00306],
            displayMode: 'lines',
          },
        ],
        settings: {
          showYAxis: true,
          mergeUnits: false,
          showMinMax: false,
          showGridlines: true,
        },
        dateFrom: '2022-01-30T23:00:27.249Z',
        name: 'New chart',
        public: false,
        workflowCollection: [
          {
            connections: [],
            lineWeight: 1,
            unit: '',
            calls: [],
            id: '1f358922-78a2-4547-8e99-f0e88e8f963b',
            enabled: true,
            type: 'workflow',
            createdAt: 1646222965115,
            name: 'New Calculation',
            preferredUnit: '',
            color: '#8a3800',
            lineStyle: 'solid',
            version: 'v2',
            nodes: [
              {
                color: '#FC2574',
                functionEffectReference: 'SOURCE_REFERENCE',
                x: 142,
                id: 'ba550fc4-747a-489a-aafb-dcc89efb2282',
                icon: 'Function',
                outputPins: [
                  {
                    id: 'result',
                    type: 'TIMESERIES',
                    title: 'Time Series',
                  },
                ],
                inputPins: [],
                y: 113,
                title: 'Input',
                functionData: {
                  sourceId: '',
                  type: '',
                },
                calls: [],
                subtitle: 'Source',
              },
              {
                x: 148,
                outputPins: [
                  {
                    id: 'result',
                    title: 'Time Series',
                    type: 'TIMESERIES',
                  },
                ],
                id: '3c338e88-43ca-4771-b8ec-d5bcca9eb774',
                y: 269,
                subtitle: 'Source',
                icon: 'Function',
                functionData: {
                  type: '',
                  sourceId: '',
                },
                calls: [],
                title: 'Input',
                functionEffectReference: 'SOURCE_REFERENCE',
                inputPins: [],
                color: '#FC2574',
              },
              {
                icon: 'Function',
                subtitle: 'Function',
                inputPins: [],
                functionData: {
                  toolFunction: {},
                },
                y: 193,
                outputPins: [],
                color: '#9118af',
                title: 'Function',
                id: 'a1df3603-c907-471d-902a-ecced2cbb7f9',
                calls: [],
                functionEffectReference: 'TOOLBOX_FUNCTION',
                x: 483,
              },
              {
                outputPins: [],
                inputPins: [
                  {
                    types: ['TIMESERIES'],
                    id: 'datapoints',
                    title: 'Time Series',
                  },
                ],
                calls: [],
                x: 800,
                subtitle: 'CHART OUTPUT',
                y: 123,
                icon: 'Icon',
                title: 'Output',
                functionEffectReference: 'OUTPUT',
                id: '268b60f5-e5a6-46a2-ad9b-a7d0a58c3cb6',
                color: '#4A67FB',
              },
            ],
            flow: {
              position: [0, 0],
              zoom: 1,
              elements: [
                {
                  id: 'ba550fc4-747a-489a-aafb-dcc89efb2282',
                  type: 'CalculationInput',
                  position: {
                    x: 142,
                    y: 113,
                  },
                  data: {
                    selectedSourceId: '',
                    type: '',
                  },
                },
                {
                  id: '3c338e88-43ca-4771-b8ec-d5bcca9eb774',
                  type: 'CalculationInput',
                  position: {
                    x: 148,
                    y: 269,
                  },
                  data: {
                    selectedSourceId: '',
                    type: '',
                  },
                },
                {
                  id: '268b60f5-e5a6-46a2-ad9b-a7d0a58c3cb6',
                  type: 'CalculationOutput',
                  position: {
                    x: 800,
                    y: 123,
                  },
                },
              ],
            },
            settings: {
              autoAlign: true,
            },
          },
        ],
        id: '8e0342c5-dd24-42b8-9b9d-a71ff86ced9d',
        version: 1,
      });
    });
  });

  describe('Update Chart Thresholds', () => {
    it('should add a new threshold', () => {
      const existingChart: Chart = {
        version: 1,
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
        name: 'Demo: Power Consumption',
        user: 'shekhar.sharma@cognite.com',
        dateTo: '2021-11-12T20:21:40.881Z',
        dateFrom: '2020-04-25T07:05:31.547Z',
        createdAt: 1647350374178,
        updatedAt: 1651506075740,
      };

      const newThreshold: ChartThreshold = {
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
        name: 'New threshold',
        type: 'under',
        visible: true,
        filter: {},
      };

      const updatedChart = addChartThreshold(existingChart, newThreshold);

      expect(updatedChart).toEqual({
        version: 1,
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
        name: 'Demo: Power Consumption',
        thresholdCollection: [
          {
            id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
            name: 'New threshold',
            type: 'under',
            visible: true,
            filter: {},
          },
        ],
        user: 'shekhar.sharma@cognite.com',
        dateTo: '2021-11-12T20:21:40.881Z',
        dateFrom: '2020-04-25T07:05:31.547Z',
        createdAt: 1647350374178,
        updatedAt: 1651506075740,
      });
    });

    it('should remove a threshold', () => {
      const existingChart: Chart = {
        version: 1,
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
        name: 'Demo: Power Consumption',
        thresholdCollection: [
          {
            id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
            name: 'New threshold',
            type: 'under',
            visible: true,
            filter: {},
          },
        ],
        user: 'shekhar.sharma@cognite.com',
        dateTo: '2021-11-12T20:21:40.881Z',
        dateFrom: '2020-04-25T07:05:31.547Z',
        createdAt: 1647350374178,
        updatedAt: 1651506075740,
      };
      const thresholdID = 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d';

      const updatedChart = removeChartThreshold(existingChart, thresholdID);

      expect(updatedChart).toEqual({
        version: 1,
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
        name: 'Demo: Power Consumption',
        thresholdCollection: [],
        user: 'shekhar.sharma@cognite.com',
        dateTo: '2021-11-12T20:21:40.881Z',
        dateFrom: '2020-04-25T07:05:31.547Z',
        createdAt: 1647350374178,
        updatedAt: 1651506075740,
      });
    });

    it('should update threshold name', () => {
      const existingChart: Chart = {
        version: 1,
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
        name: 'Demo: Power Consumption',
        thresholdCollection: [
          {
            id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
            name: 'New threshold',
            type: 'under',
            visible: true,
            filter: {},
          },
        ],
        user: 'shekhar.sharma@cognite.com',
        dateTo: '2021-11-12T20:21:40.881Z',
        dateFrom: '2020-04-25T07:05:31.547Z',
        createdAt: 1647350374178,
        updatedAt: 1651506075740,
      };
      const thresholdID = 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d';
      const thresholdName = 'Threshold Updated Name';

      const updatedChart = updateChartThresholdName(
        existingChart,
        thresholdID,
        thresholdName
      );

      expect(updatedChart).toEqual({
        version: 1,
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
        name: 'Demo: Power Consumption',
        thresholdCollection: [
          {
            id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
            name: 'Threshold Updated Name',
            type: 'under',
            visible: true,
            filter: {},
          },
        ],
        user: 'shekhar.sharma@cognite.com',
        dateTo: '2021-11-12T20:21:40.881Z',
        dateFrom: '2020-04-25T07:05:31.547Z',
        createdAt: 1647350374178,
        updatedAt: 1651506075740,
      });
    });

    it('should update threshold visibility', () => {
      const existingChart: Chart = {
        version: 1,
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
        name: 'Demo: Power Consumption',
        thresholdCollection: [
          {
            id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
            name: 'New threshold',
            type: 'under',
            visible: true,
            filter: {},
          },
        ],
        user: 'shekhar.sharma@cognite.com',
        dateTo: '2021-11-12T20:21:40.881Z',
        dateFrom: '2020-04-25T07:05:31.547Z',
        createdAt: 1647350374178,
        updatedAt: 1651506075740,
      };
      const thresholdID = 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d';

      const updatedChart = updateChartThresholdVisibility(
        existingChart,
        thresholdID,
        false
      );

      expect(updatedChart).toEqual({
        version: 1,
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
        name: 'Demo: Power Consumption',
        thresholdCollection: [
          {
            id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
            name: 'New threshold',
            type: 'under',
            visible: false,
            filter: {},
          },
        ],
        user: 'shekhar.sharma@cognite.com',
        dateTo: '2021-11-12T20:21:40.881Z',
        dateFrom: '2020-04-25T07:05:31.547Z',
        createdAt: 1647350374178,
        updatedAt: 1651506075740,
      });
    });

    it('should update threshold selected source', () => {
      const existingChart: Chart = {
        version: 1,
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
        name: 'Demo: Power Consumption',
        thresholdCollection: [
          {
            id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
            sourceId: '',
            name: 'New threshold',
            type: 'under',
            visible: true,
            filter: {},
          },
        ],
        user: 'shekhar.sharma@cognite.com',
        dateTo: '2021-11-12T20:21:40.881Z',
        dateFrom: '2020-04-25T07:05:31.547Z',
        createdAt: 1647350374178,
        updatedAt: 1651506075740,
      };
      const thresholdID = 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d';
      const selectedSourceID = '1f358922-78a2-4547-8e99-f0e88e8f963b';

      const updatedChart = updateChartThresholdSelectedSource(
        existingChart,
        thresholdID,
        selectedSourceID
      );

      expect(updatedChart).toEqual({
        version: 1,
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
        name: 'Demo: Power Consumption',
        thresholdCollection: [
          {
            id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
            sourceId: '1f358922-78a2-4547-8e99-f0e88e8f963b',
            name: 'New threshold',
            type: 'under',
            visible: true,
            filter: {},
          },
        ],
        user: 'shekhar.sharma@cognite.com',
        dateTo: '2021-11-12T20:21:40.881Z',
        dateFrom: '2020-04-25T07:05:31.547Z',
        createdAt: 1647350374178,
        updatedAt: 1651506075740,
      });
    });

    it('should update threshold type', () => {
      const existingChart: Chart = {
        version: 1,
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
        name: 'Demo: Power Consumption',
        thresholdCollection: [
          {
            id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
            name: 'New threshold',
            type: 'under',
            visible: true,
            filter: {},
          },
        ],
        user: 'shekhar.sharma@cognite.com',
        dateTo: '2021-11-12T20:21:40.881Z',
        dateFrom: '2020-04-25T07:05:31.547Z',
        createdAt: 1647350374178,
        updatedAt: 1651506075740,
      };
      const thresholdID = 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d';
      const updatedType = 'between';

      const updatedChart = updateChartThresholdType(
        existingChart,
        thresholdID,
        updatedType
      );

      expect(updatedChart).toEqual({
        version: 1,
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
        name: 'Demo: Power Consumption',
        thresholdCollection: [
          {
            id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
            name: 'New threshold',
            type: 'between',
            visible: true,
            filter: {},
          },
        ],
        user: 'shekhar.sharma@cognite.com',
        dateTo: '2021-11-12T20:21:40.881Z',
        dateFrom: '2020-04-25T07:05:31.547Z',
        createdAt: 1647350374178,
        updatedAt: 1651506075740,
      });
    });

    it('should update threshold lower limit', () => {
      const existingChart: Chart = {
        version: 1,
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
        name: 'Demo: Power Consumption',
        thresholdCollection: [
          {
            id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
            name: 'New threshold',
            lowerLimit: 0,
            upperLimit: 0,
            type: 'under',
            visible: true,
            filter: {},
          },
        ],
        user: 'shekhar.sharma@cognite.com',
        dateTo: '2021-11-12T20:21:40.881Z',
        dateFrom: '2020-04-25T07:05:31.547Z',
        createdAt: 1647350374178,
        updatedAt: 1651506075740,
      };

      const thresholdID = 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d';

      const updatedChart = updateChartThresholdLowerLimit(
        existingChart,
        thresholdID,
        10
      );

      expect(updatedChart).toEqual({
        version: 1,
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
        name: 'Demo: Power Consumption',
        thresholdCollection: [
          {
            id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
            name: 'New threshold',
            lowerLimit: 10,
            upperLimit: 0,
            type: 'under',
            visible: true,
            filter: {},
          },
        ],
        user: 'shekhar.sharma@cognite.com',
        dateTo: '2021-11-12T20:21:40.881Z',
        dateFrom: '2020-04-25T07:05:31.547Z',
        createdAt: 1647350374178,
        updatedAt: 1651506075740,
      });
    });

    it('should update threshold upper limit', () => {
      const existingChart: Chart = {
        version: 1,
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
        name: 'Demo: Power Consumption',
        thresholdCollection: [
          {
            id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
            name: 'New threshold',
            lowerLimit: 0,
            upperLimit: 0,
            type: 'under',
            visible: true,
            filter: {},
          },
        ],
        user: 'shekhar.sharma@cognite.com',
        dateTo: '2021-11-12T20:21:40.881Z',
        dateFrom: '2020-04-25T07:05:31.547Z',
        createdAt: 1647350374178,
        updatedAt: 1651506075740,
      };

      const thresholdID = 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d';

      const updatedChart = updateChartThresholdUpperLimit(
        existingChart,
        thresholdID,
        10
      );

      expect(updatedChart).toEqual({
        version: 1,
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
        name: 'Demo: Power Consumption',
        thresholdCollection: [
          {
            id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
            name: 'New threshold',
            lowerLimit: 0,
            upperLimit: 10,
            type: 'under',
            visible: true,
            filter: {},
          },
        ],
        user: 'shekhar.sharma@cognite.com',
        dateTo: '2021-11-12T20:21:40.881Z',
        dateFrom: '2020-04-25T07:05:31.547Z',
        createdAt: 1647350374178,
        updatedAt: 1651506075740,
      });
    });

    it('should update threshold event filters', () => {
      const existingChart: Chart = {
        version: 1,
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
        name: 'Demo: Power Consumption',
        thresholdCollection: [
          {
            id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
            name: 'New threshold',
            lowerLimit: 0,
            upperLimit: 0,
            type: 'under',
            visible: true,
            filter: {},
          },
        ],
        user: 'shekhar.sharma@cognite.com',
        dateTo: '2021-11-12T20:21:40.881Z',
        dateFrom: '2020-04-25T07:05:31.547Z',
        createdAt: 1647350374178,
        updatedAt: 1651506075740,
      };

      const thresholdID = 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d';
      const filters = {
        minValue: 0,
        maxValue: 1000,
        minUnit: 's',
        maxUnit: 'h',
      };

      const updatedChart = updateChartThresholdEventFilters(
        existingChart,
        thresholdID,
        filters
      );

      expect(updatedChart).toEqual({
        version: 1,
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
        name: 'Demo: Power Consumption',
        thresholdCollection: [
          {
            id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
            name: 'New threshold',
            lowerLimit: 0,
            upperLimit: 0,
            type: 'under',
            visible: true,
            filter: {
              minValue: 0,
              maxValue: 1000,
              minUnit: 's',
              maxUnit: 'h',
            },
          },
        ],
        user: 'shekhar.sharma@cognite.com',
        dateTo: '2021-11-12T20:21:40.881Z',
        dateFrom: '2020-04-25T07:05:31.547Z',
        createdAt: 1647350374178,
        updatedAt: 1651506075740,
      });
    });

    it('should update threshold properties', () => {
      const existingChart: Chart = {
        version: 1,
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
        name: 'Demo: Power Consumption',
        thresholdCollection: [
          {
            id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
            name: 'New threshold',
            lowerLimit: 10,
            upperLimit: 20,
            type: 'under',
            visible: true,
            filter: {},
          },
        ],
        user: 'shekhar.sharma@cognite.com',
        dateTo: '2021-11-12T20:21:40.881Z',
        dateFrom: '2020-04-25T07:05:31.547Z',
        createdAt: 1647350374178,
        updatedAt: 1651506075740,
      };

      const thresholdID = 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d';

      const updatedChart = updateChartThresholdProperties(
        existingChart,
        thresholdID,
        { upperLimit: 30 }
      );

      expect(updatedChart).toEqual({
        version: 1,
        id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
        name: 'Demo: Power Consumption',
        thresholdCollection: [
          {
            id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
            name: 'New threshold',
            lowerLimit: 10,
            upperLimit: 30,
            type: 'under',
            visible: true,
            filter: {},
          },
        ],
        user: 'shekhar.sharma@cognite.com',
        dateTo: '2021-11-12T20:21:40.881Z',
        dateFrom: '2020-04-25T07:05:31.547Z',
        createdAt: 1647350374178,
        updatedAt: 1651506075740,
      });
    });
  });
});
