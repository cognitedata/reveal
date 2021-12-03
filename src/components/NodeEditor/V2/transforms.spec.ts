import { OperationParametersTypeEnum } from '@cognite/calculation-backend';
import { Chart, ChartWorkflowV2 } from 'models/chart/types';
import {
  getStepsFromWorkflowReactFlow,
  transformParamInput,
} from './transforms';
import {
  workflowCollectionMock,
  workflowCollectionMock2,
  workflowCollectionMock3,
} from './transforms.spec.mocks';

describe('transformParamInput', () => {
  it('transforms a 0 float correctly', () => {
    const testCases: [OperationParametersTypeEnum, string, string | number][] =
      [
        [OperationParametersTypeEnum.Str, '0', '0'],
        [OperationParametersTypeEnum.Str, 'false', 'false'],
        [OperationParametersTypeEnum.Str, 'true', 'true'],
        [OperationParametersTypeEnum.Str, '12.3245', '12.3245'],
        [OperationParametersTypeEnum.Int, '0', 0],
        [OperationParametersTypeEnum.Int, '12.3245', 12],
        [OperationParametersTypeEnum.Int, 'false', ''],
        [OperationParametersTypeEnum.Float, '0', 0],
        [OperationParametersTypeEnum.Float, '12.345', 12.345],
        [OperationParametersTypeEnum.Float, '1e-6', 0.000001],
        [OperationParametersTypeEnum.Float, '1e6', 1000000],
        [OperationParametersTypeEnum.Float, 'false', ''],
        [OperationParametersTypeEnum.Float, 'true', ''],
      ];

    testCases.forEach((testCase) => {
      const granularity = transformParamInput(testCase[0], testCase[1]);
      expect(granularity).toEqual(testCase[2]);
    });
  });
});

describe('getStepsFromWorkflowReactFlow', () => {
  it('generates correct steps (empty workflow)', () => {
    const workflow: ChartWorkflowV2 = {
      version: 'v2',
      id: 'abc123',
      name: 'Empty workflow',
      color: '#FFF',
      flow: { elements: [], position: [0, 0], zoom: 1 },
      enabled: true,
    };

    const steps = getStepsFromWorkflowReactFlow(workflow);

    expect(steps).toEqual([]);
  });

  it('generates correct steps (only output node)', () => {
    const workflow: ChartWorkflowV2 = {
      version: 'v2',
      id: 'abc123',
      name: 'Empty workflow',
      color: '#FFF',
      flow: {
        elements: [
          {
            data: {
              color: '#1192e8',
              name: 'New Calculation',
            },
            type: 'CalculationOutput',
            position: {
              x: 394,
              y: 127,
            },
            id: 'DJ57sdlcczCoc9--uOF2_',
          },
        ],
        position: [0, 0],
        zoom: 1,
      },
      enabled: true,
    };

    const steps = getStepsFromWorkflowReactFlow(workflow);

    expect(steps).toEqual([]);
  });

  it('generates correct steps (multistep computation)', () => {
    const workflow: ChartWorkflowV2 = {
      version: 'v2',
      id: 'abc123',
      name: 'Empty workflow',
      color: '#FFF',
      flow: {
        elements: [
          {
            id: 'w5ivU9w58jxfUz7htTPUe',
            type: 'CalculationOutput',
            data: {
              color: '#6929c4',
              name: 'New Calculation',
            },
            position: {
              x: 1031,
              y: 108,
            },
          },
          {
            id: 'ZNyEwM0gqzMpXaSd_GPKW',
            type: 'CalculationInput',
            position: {
              x: 96,
              y: 84,
            },
            data: {
              type: 'timeseries',
              sourceOptions: [],
              selectedSourceId: 'j350Z4nwnOfk212Nu3bks',
            },
          },
          {
            data: {
              sourceOptions: [],
              type: 'timeseries',
              selectedSourceId: 'RvXihRaJJujRDDFKC4D1-',
            },
            id: 'x1Psfywpu3O2BXwHkqH-K',
            type: 'CalculationInput',
            position: {
              x: 99,
              y: 228,
            },
          },
          {
            type: 'ToolboxFunction',
            data: {
              functionData: {
                granularity: '1h',
                aggregate: 'mean',
              },
              toolFunction: {
                name: 'Resample to granularity',
                op: 'resample_to_granularity',
                inputs: [
                  {
                    description: null,
                    name: 'Time series.',
                    param: 'series',
                    types: ['ts'],
                  },
                ],
              },
            },
            position: {
              x: 517,
              y: 74,
            },
            id: 'a_HOVHQ71v5pXYvV7usq_',
          },
          {
            position: {
              x: 517.3818181818183,
              y: 220.9057851239669,
            },
            id: '9-RiktpSALNrlmwqoUPkt',
            type: 'ToolboxFunction',
            data: {
              toolFunction: {
                name: 'Resample to granularity',
                op: 'resample_to_granularity',
                inputs: [
                  {
                    description: null,
                    name: 'Time series.',
                    param: 'series',
                    types: ['ts'],
                  },
                ],
              },
              functionData: {
                granularity: '1h',
                aggregate: 'mean',
              },
            },
          },
          {
            type: 'ToolboxFunction',
            data: {
              toolFunction: {
                name: 'Subtraction',
                op: 'sub',
                inputs: [
                  {
                    description: null,
                    name: 'Time-series or number.',
                    param: 'a',
                    types: ['ts', 'const'],
                  },
                  {
                    description: null,
                    name: 'Time-series or number.',
                    param: 'b',
                    types: ['ts', 'const'],
                  },
                ],
              },
              functionData: {},
            },
            id: 'I3ezdixmgmf1ux-DRVZvs',
            position: {
              x: 806.6793388429753,
              y: 112.2545454545454,
            },
          },
          {
            id: 'fBeMz6erfK4zd0FnJDO9M',
            type: 'ToolboxFunction',
            data: {
              toolFunction: {
                name: 'Saviztky-Golay',
                op: 'sg',
                inputs: [
                  {
                    description:
                      'Time series to be smoothed. The series must have a pandas.DatetimeIndex.',
                    name: 'Time series.',
                    param: 'data',
                    types: ['ts'],
                  },
                ],
              },
              functionData: {
                polyorder: 1,
              },
            },
            position: {
              x: 903,
              y: 229,
            },
          },
          {
            type: 'default',
            id: 'reactflow__edge-ZNyEwM0gqzMpXaSd_GPKWresult-a_HOVHQ71v5pXYvV7usq_series',
            target: 'a_HOVHQ71v5pXYvV7usq_',
            source: 'ZNyEwM0gqzMpXaSd_GPKW',
            sourceHandle: 'result',
            targetHandle: 'series',
          },
          {
            type: 'default',
            id: 'reactflow__edge-x1Psfywpu3O2BXwHkqH-Kresult-9-RiktpSALNrlmwqoUPktseries',
            target: '9-RiktpSALNrlmwqoUPkt',
            sourceHandle: 'result',
            source: 'x1Psfywpu3O2BXwHkqH-K',
            targetHandle: 'series',
          },
          {
            type: 'default',
            target: 'I3ezdixmgmf1ux-DRVZvs',
            sourceHandle: 'out-result',
            id: 'reactflow__edge-9-RiktpSALNrlmwqoUPktout-result-I3ezdixmgmf1ux-DRVZvsb',
            source: '9-RiktpSALNrlmwqoUPkt',
            targetHandle: 'b',
          },
          {
            id: 'reactflow__edge-a_HOVHQ71v5pXYvV7usq_out-result-I3ezdixmgmf1ux-DRVZvsa',
            sourceHandle: 'out-result',
            source: 'a_HOVHQ71v5pXYvV7usq_',
            type: 'default',
            target: 'I3ezdixmgmf1ux-DRVZvs',
            targetHandle: 'a',
          },
          {
            source: 'I3ezdixmgmf1ux-DRVZvs',
            sourceHandle: 'out-result',
            target: 'fBeMz6erfK4zd0FnJDO9M',
            targetHandle: 'data',
            id: 'reactflow__edge-I3ezdixmgmf1ux-DRVZvsout-result-fBeMz6erfK4zd0FnJDO9Mdata',
            type: 'default',
          },
          {
            source: 'fBeMz6erfK4zd0FnJDO9M',
            sourceHandle: 'out-result',
            target: 'w5ivU9w58jxfUz7htTPUe',
            targetHandle: 'datapoints',
            id: 'reactflow__edge-fBeMz6erfK4zd0FnJDO9Mout-result-w5ivU9w58jxfUz7htTPUedatapoints',
            type: 'default',
          },
        ],
        position: [0, 0],
        zoom: 1,
      },
      enabled: true,
    };

    const settings = {};

    const steps = getStepsFromWorkflowReactFlow(workflow, settings);

    expect(steps).toEqual([
      {
        step: 0,
        op: 'resample_to_granularity',
        inputs: [
          {
            type: 'ts',
            value: 'RvXihRaJJujRDDFKC4D1-',
          },
        ],
        params: {
          granularity: '1h',
          aggregate: 'mean',
        },
      },
      {
        step: 1,
        op: 'resample_to_granularity',
        inputs: [
          {
            type: 'ts',
            value: 'j350Z4nwnOfk212Nu3bks',
          },
        ],
        params: {
          granularity: '1h',
          aggregate: 'mean',
        },
      },
      {
        step: 2,
        op: 'sub',
        inputs: [
          {
            type: 'result',
            value: 1,
          },
          {
            type: 'result',
            value: 0,
          },
        ],
      },
      {
        step: 3,
        op: 'sg',
        inputs: [
          {
            type: 'result',
            value: 2,
          },
        ],
        params: {
          polyorder: 1,
        },
      },
      {
        step: 4,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'result',
            value: 3,
          },
        ],
      },
    ]);
  });

  it('generates correct steps (noop computation)', () => {
    const workflow: ChartWorkflowV2 = {
      version: 'v2',
      id: 'abc123',
      name: 'Empty workflow',
      color: '#FFF',
      flow: {
        elements: [
          {
            id: 'KCTPlxTWTiTDsYFn3GOhK',
            type: 'CalculationOutput',
            data: {
              color: '#6929c4',
              name: 'New Calculation',
            },
            position: {
              x: 588,
              y: 268,
            },
          },
          {
            id: 'w1qgICaIFEShPAyEow5lz',
            type: 'CalculationInput',
            data: {
              type: 'timeseries',
              selectedSourceId: 'RvXihRaJJujRDDFKC4D1-',
              sourceOptions: [],
            },
            position: {
              x: 82,
              y: 149,
            },
          },
          {
            source: 'w1qgICaIFEShPAyEow5lz',
            sourceHandle: 'result',
            target: 'KCTPlxTWTiTDsYFn3GOhK',
            targetHandle: 'datapoints',
            id: 'reactflow__edge-w1qgICaIFEShPAyEow5lzresult-KCTPlxTWTiTDsYFn3GOhKdatapoints',
            type: 'default',
          },
        ],
        position: [0, 0],
        zoom: 1,
      },
      enabled: true,
    };

    const settings = {};

    const steps = getStepsFromWorkflowReactFlow(workflow, settings);

    expect(steps).toEqual([
      {
        step: 0,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'ts',
            value: 'RvXihRaJJujRDDFKC4D1-',
          },
        ],
      },
    ]);
  });

  it('generates correct steps (dangling nodes)', () => {
    const workflow: ChartWorkflowV2 = {
      version: 'v2',
      id: 'abc123',
      name: 'Empty workflow',
      color: '#FFF',
      flow: {
        elements: [
          {
            id: 'w5ivU9w58jxfUz7htTPUe',
            data: {
              name: 'New Calculation',
              color: '#6929c4',
            },
            type: 'CalculationOutput',
            position: {
              x: 1031,
              y: 108,
            },
          },
          {
            data: {
              type: 'timeseries',
              sourceOptions: [],
              selectedSourceId: 'j350Z4nwnOfk212Nu3bks',
            },
            id: 'ZNyEwM0gqzMpXaSd_GPKW',
            position: {
              x: 96,
              y: 84,
            },
            type: 'CalculationInput',
          },
          {
            data: {
              selectedSourceId: 'RvXihRaJJujRDDFKC4D1-',
              sourceOptions: [],
              type: 'timeseries',
            },
            id: 'x1Psfywpu3O2BXwHkqH-K',
            position: {
              x: 99,
              y: 228,
            },
            type: 'CalculationInput',
          },
          {
            position: {
              x: 517,
              y: 74,
            },
            data: {
              toolFunction: {
                name: 'Resample to granularity',
                op: 'resample_to_granularity',
                inputs: [
                  {
                    description: null,
                    name: 'Time series.',
                    param: 'series',
                    types: ['ts'],
                  },
                ],
              },
              functionData: {
                granularity: '1h',
                aggregate: 'mean',
              },
            },
            type: 'ToolboxFunction',
            id: 'a_HOVHQ71v5pXYvV7usq_',
          },
          {
            data: {
              functionData: {
                aggregate: 'mean',
                granularity: '1h',
              },
              toolFunction: {
                op: 'resample_to_granularity',
                name: 'Resample to granularity',
                inputs: [
                  {
                    description: null,
                    name: 'Time series.',
                    param: 'series',
                    types: ['ts'],
                  },
                ],
              },
            },
            id: '9-RiktpSALNrlmwqoUPkt',
            position: {
              x: 517.3818181818183,
              y: 220.9057851239669,
            },
            type: 'ToolboxFunction',
          },
          {
            id: 'I3ezdixmgmf1ux-DRVZvs',
            data: {
              toolFunction: {
                op: 'sub',
                name: 'Subtraction',
                inputs: [
                  {
                    description: null,
                    name: 'Time-series or number.',
                    param: 'a',
                    types: ['ts', 'const'],
                  },
                  {
                    description: null,
                    name: 'Time-series or number.',
                    param: 'b',
                    types: ['ts', 'const'],
                  },
                ],
              },
              functionData: {},
            },
            position: {
              x: 806.6793388429753,
              y: 112.2545454545454,
            },
            type: 'ToolboxFunction',
          },
          {
            id: 'I-2qBwiQJP4ZRtuKauySd',
            type: 'ToolboxFunction',
            data: {
              toolFunction: {
                name: 'Saviztky-Golay',
                op: 'sg',
                inputs: [
                  {
                    description:
                      'Time series to be smoothed. The series must have a pandas.DatetimeIndex.',
                    name: 'Time series.',
                    param: 'data',
                    types: ['ts'],
                  },
                ],
              },
              functionData: {
                polyorder: 1,
              },
            },
            position: {
              x: 911.5,
              y: 1,
            },
          },
          {
            id: 'CxTLwnn3oXdVWOMWfxrSt',
            type: 'CalculationInput',
            data: {
              type: 'timeseries',
              selectedSourceId: 'j350Z4nwnOfk212Nu3bks',
              sourceOptions: [],
            },
            position: {
              x: 467.5,
              y: 347,
            },
          },
          {
            id: 'riQbFoJDGKLu_Rth60WVF',
            type: 'ToolboxFunction',
            data: {
              toolFunction: {
                name: 'Add',
                op: 'add',
              },
              functionData: {},
            },
            position: {
              x: 837.5,
              y: 323,
            },
          },
          {
            id: 'reactflow__edge-ZNyEwM0gqzMpXaSd_GPKWresult-a_HOVHQ71v5pXYvV7usq_series',
            target: 'a_HOVHQ71v5pXYvV7usq_',
            targetHandle: 'series',
            type: 'default',
            source: 'ZNyEwM0gqzMpXaSd_GPKW',
            sourceHandle: 'result',
          },
          {
            type: 'default',
            target: '9-RiktpSALNrlmwqoUPkt',
            id: 'reactflow__edge-x1Psfywpu3O2BXwHkqH-Kresult-9-RiktpSALNrlmwqoUPktseries',
            sourceHandle: 'result',
            targetHandle: 'series',
            source: 'x1Psfywpu3O2BXwHkqH-K',
          },
          {
            target: 'I3ezdixmgmf1ux-DRVZvs',
            type: 'default',
            targetHandle: 'b',
            id: 'reactflow__edge-9-RiktpSALNrlmwqoUPktout-result-I3ezdixmgmf1ux-DRVZvsb',
            source: '9-RiktpSALNrlmwqoUPkt',
            sourceHandle: 'out-result',
          },
          {
            type: 'default',
            source: 'a_HOVHQ71v5pXYvV7usq_',
            targetHandle: 'a',
            sourceHandle: 'out-result',
            target: 'I3ezdixmgmf1ux-DRVZvs',
            id: 'reactflow__edge-a_HOVHQ71v5pXYvV7usq_out-result-I3ezdixmgmf1ux-DRVZvsa',
          },
          {
            targetHandle: 'data',
            type: 'default',
            source: 'I3ezdixmgmf1ux-DRVZvs',
            target: 'I-2qBwiQJP4ZRtuKauySd',
            sourceHandle: 'out-result',
            id: 'reactflow__edge-I3ezdixmgmf1ux-DRVZvsout-result-I-2qBwiQJP4ZRtuKauySddata',
          },
          {
            source: 'I-2qBwiQJP4ZRtuKauySd',
            sourceHandle: 'out-result',
            target: 'w5ivU9w58jxfUz7htTPUe',
            targetHandle: 'datapoints',
            id: 'reactflow__edge-I-2qBwiQJP4ZRtuKauySdout-result-w5ivU9w58jxfUz7htTPUedatapoints',
            type: 'default',
          },
          {
            source: 'CxTLwnn3oXdVWOMWfxrSt',
            sourceHandle: 'result',
            target: 'riQbFoJDGKLu_Rth60WVF',
            targetHandle: 'a',
            id: 'reactflow__edge-CxTLwnn3oXdVWOMWfxrStresult-riQbFoJDGKLu_Rth60WVFa',
            type: 'default',
          },
        ],
        position: [0, 0],
        zoom: 1,
      },
      enabled: true,
    };

    const settings = {};

    const steps = getStepsFromWorkflowReactFlow(workflow, settings);

    expect(steps).toEqual([
      {
        step: 0,
        op: 'resample_to_granularity',
        inputs: [
          {
            type: 'ts',
            value: 'RvXihRaJJujRDDFKC4D1-',
          },
        ],
        params: {
          granularity: '1h',
          aggregate: 'mean',
        },
      },
      {
        step: 1,
        op: 'resample_to_granularity',
        inputs: [
          {
            type: 'ts',
            value: 'j350Z4nwnOfk212Nu3bks',
          },
        ],
        params: {
          granularity: '1h',
          aggregate: 'mean',
        },
      },
      {
        step: 2,
        op: 'sub',
        inputs: [
          {
            type: 'result',
            value: 1,
          },
          {
            type: 'result',
            value: 0,
          },
        ],
      },
      {
        step: 3,
        op: 'sg',
        inputs: [
          {
            type: 'result',
            value: 2,
          },
        ],
        params: {
          polyorder: 1,
        },
      },
      {
        step: 4,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'result',
            value: 3,
          },
        ],
      },
    ]);
  });

  it('generates correct steps (another calculation as input)', () => {
    const workflows = [
      {
        version: 'v2',
        type: 'workflow',
        name: 'ΔP',
        createdAt: 1635243137501,
        color: '#005d5d',
        flow: {
          elements: [
            {
              id: 'w5ivU9w58jxfUz7htTPUe',
              data: {
                name: 'New Calculation',
                color: '#6929c4',
              },
              type: 'CalculationOutput',
              position: {
                x: 1031,
                y: 108,
              },
            },
            {
              data: {
                type: 'timeseries',
                sourceOptions: [],
                selectedSourceId: 'j350Z4nwnOfk212Nu3bks',
              },
              id: 'ZNyEwM0gqzMpXaSd_GPKW',
              position: {
                x: 96,
                y: 84,
              },
              type: 'CalculationInput',
            },
            {
              data: {
                selectedSourceId: 'RvXihRaJJujRDDFKC4D1-',
                sourceOptions: [],
                type: 'timeseries',
              },
              id: 'x1Psfywpu3O2BXwHkqH-K',
              position: {
                x: 99,
                y: 228,
              },
              type: 'CalculationInput',
            },
            {
              position: {
                x: 517,
                y: 74,
              },
              data: {
                toolFunction: {
                  name: 'Resample to granularity',
                  op: 'resample_to_granularity',
                  inputs: [
                    {
                      description: null,
                      name: 'Time series.',
                      param: 'series',
                      types: ['ts'],
                    },
                  ],
                },
                functionData: {
                  granularity: '1h',
                  aggregate: 'mean',
                },
              },
              type: 'ToolboxFunction',
              id: 'a_HOVHQ71v5pXYvV7usq_',
            },
            {
              data: {
                functionData: {
                  aggregate: 'mean',
                  granularity: '1h',
                },
                toolFunction: {
                  op: 'resample_to_granularity',
                  name: 'Resample to granularity',
                  inputs: [
                    {
                      description: null,
                      name: 'Time series.',
                      param: 'series',
                      types: ['ts'],
                    },
                  ],
                },
              },
              id: '9-RiktpSALNrlmwqoUPkt',
              position: {
                x: 517.3818181818183,
                y: 220.9057851239669,
              },
              type: 'ToolboxFunction',
            },
            {
              id: 'I3ezdixmgmf1ux-DRVZvs',
              data: {
                toolFunction: {
                  op: 'sub',
                  name: 'Subtraction',
                  inputs: [
                    {
                      description: null,
                      name: 'Time-series or number.',
                      param: 'a',
                      types: ['ts', 'const'],
                    },
                    {
                      description: null,
                      name: 'Time-series or number.',
                      param: 'b',
                      types: ['ts', 'const'],
                    },
                  ],
                },
                functionData: {},
              },
              position: {
                x: 806.6793388429753,
                y: 112.2545454545454,
              },
              type: 'ToolboxFunction',
            },
            {
              id: 'reactflow__edge-ZNyEwM0gqzMpXaSd_GPKWresult-a_HOVHQ71v5pXYvV7usq_series',
              target: 'a_HOVHQ71v5pXYvV7usq_',
              targetHandle: 'series',
              type: 'default',
              source: 'ZNyEwM0gqzMpXaSd_GPKW',
              sourceHandle: 'result',
            },
            {
              type: 'default',
              target: '9-RiktpSALNrlmwqoUPkt',
              id: 'reactflow__edge-x1Psfywpu3O2BXwHkqH-Kresult-9-RiktpSALNrlmwqoUPktseries',
              sourceHandle: 'result',
              targetHandle: 'series',
              source: 'x1Psfywpu3O2BXwHkqH-K',
            },
            {
              target: 'I3ezdixmgmf1ux-DRVZvs',
              type: 'default',
              targetHandle: 'b',
              id: 'reactflow__edge-9-RiktpSALNrlmwqoUPktout-result-I3ezdixmgmf1ux-DRVZvsb',
              source: '9-RiktpSALNrlmwqoUPkt',
              sourceHandle: 'out-result',
            },
            {
              type: 'default',
              source: 'a_HOVHQ71v5pXYvV7usq_',
              targetHandle: 'a',
              sourceHandle: 'out-result',
              target: 'I3ezdixmgmf1ux-DRVZvs',
              id: 'reactflow__edge-a_HOVHQ71v5pXYvV7usq_out-result-I3ezdixmgmf1ux-DRVZvsa',
            },
            {
              source: 'I3ezdixmgmf1ux-DRVZvs',
              sourceHandle: 'out-result',
              target: 'w5ivU9w58jxfUz7htTPUe',
              targetHandle: 'datapoints',
              id: 'reactflow__edge-I3ezdixmgmf1ux-DRVZvsout-result-w5ivU9w58jxfUz7htTPUedatapoints',
              type: 'default',
            },
          ],
          position: [-17.75, 111.5],
          zoom: 0.5,
        },
        enabled: false,
        id: 'gAYbR4eVz12AwuTvLeIxR',
      },
      {
        version: 'v2',
        id: 'abc123',
        name: 'Empty workflow',
        color: '#FFF',
        flow: {
          elements: [
            {
              position: {
                x: 1682,
                y: 262,
              },
              type: 'CalculationOutput',
              data: {
                name: 'New Calculation',
                color: '#9f1853',
              },
              id: 'JrFD5yxRA9dJcnpAs48pp',
            },
            {
              position: {
                x: 964.75,
                y: 252.37890625,
              },
              data: {
                selectedSourceId: 'gAYbR4eVz12AwuTvLeIxR',
                type: 'workflow',
                sourceOptions: [],
              },
              id: 'rg-495YhO5rAAqjyD1X-Z',
              type: 'CalculationInput',
            },
            {
              type: 'ToolboxFunction',
              id: 'Tzcchda282s2PTA-84dMa',
              data: {
                toolFunction: {
                  name: 'Saviztky-Golay',
                  category: 'Smooth',
                  op: 'sg',
                  inputs: [
                    {
                      description:
                        'Time series to be smoothed. The series must have a pandas.DatetimeIndex.',
                      name: 'Time series.',
                      param: 'data',
                      types: ['ts'],
                    },
                  ],
                },
                functionData: {
                  window_length: 3,
                  polyorder: 50,
                },
              },
              position: {
                x: 1374.042894261608,
                y: 247.5634556695561,
              },
            },
            {
              target: 'Tzcchda282s2PTA-84dMa',
              targetHandle: 'data',
              sourceHandle: 'result',
              source: 'rg-495YhO5rAAqjyD1X-Z',
              type: 'default',
              id: 'reactflow__edge-rg-495YhO5rAAqjyD1X-Zresult-Tzcchda282s2PTA-84dMadata',
            },
            {
              sourceHandle: 'out-result',
              id: 'reactflow__edge-Tzcchda282s2PTA-84dMaout-result-JrFD5yxRA9dJcnpAs48ppdatapoints',
              type: 'default',
              source: 'Tzcchda282s2PTA-84dMa',
              targetHandle: 'datapoints',
              target: 'JrFD5yxRA9dJcnpAs48pp',
            },
          ],
          position: [0, 0],
          zoom: 1,
        },
        enabled: true,
      },
    ] as ChartWorkflowV2[];

    const workflow = workflows[1];
    const settings = {};

    const steps = getStepsFromWorkflowReactFlow(workflow, settings, workflows);

    expect(steps).toEqual([
      {
        step: 0,
        op: 'resample_to_granularity',
        inputs: [
          {
            type: 'ts',
            value: 'RvXihRaJJujRDDFKC4D1-',
          },
        ],
        params: {
          granularity: '1h',
          aggregate: 'mean',
        },
      },
      {
        step: 1,
        op: 'resample_to_granularity',
        inputs: [
          {
            type: 'ts',
            value: 'j350Z4nwnOfk212Nu3bks',
          },
        ],
        params: {
          granularity: '1h',
          aggregate: 'mean',
        },
      },
      {
        step: 2,
        op: 'sub',
        inputs: [
          {
            type: 'result',
            value: 1,
          },
          {
            type: 'result',
            value: 0,
          },
        ],
      },
      {
        step: 3,
        op: 'sg',
        inputs: [
          {
            type: 'result',
            value: 2,
          },
        ],
        params: {
          polyorder: 50,
          window_length: 3,
        },
      },
      {
        step: 4,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'result',
            value: 3,
          },
        ],
      },
    ]);
  });

  it('uses correct input order (1)', () => {
    const workflows = workflowCollectionMock;

    const workflow = workflows[3];
    const settings = {};

    const steps = getStepsFromWorkflowReactFlow(workflow, settings, workflows);

    expect(steps).toEqual([
      {
        step: 0,
        op: 'sub',
        inputs: [
          {
            type: 'ts',
            value: 'z4_SabhZ-LQjPx53WhSF5',
          },
          {
            type: 'ts',
            value: 'bHi5m84gI7hwFnPbQQ1BQ',
          },
        ],
        params: {},
      },
      {
        step: 1,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'result',
            value: 0,
          },
        ],
      },
    ]);
  });

  it('uses correct input order (2)', () => {
    const workflows = workflowCollectionMock2;

    const workflow = workflows[3];
    const settings = {};

    const steps = getStepsFromWorkflowReactFlow(workflow, settings, workflows);

    expect(steps).toEqual([
      {
        step: 0,
        op: 'mul',
        inputs: [
          {
            type: 'ts',
            value: 'z4_SabhZ-LQjPx53WhSF5',
          },
          {
            type: 'ts',
            value: 'bHi5m84gI7hwFnPbQQ1BQ',
          },
        ],
        params: {},
      },
      {
        step: 1,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'result',
            value: 0,
          },
        ],
      },
    ]);
  });

  it('should not crash when using circular references', () => {
    const chart: Chart = {
      user: 'eirik.vullum@cognite.com',
      settings: {
        mergeUnits: false,
        showGridlines: true,
        showYAxis: true,
        showMinMax: false,
      },
      timeSeriesCollection: [
        {
          displayMode: 'lines',
          preferredUnit: '',
          tsExternalId: 'VAL_21_PI_1017_04:Z.X.Value',
          createdAt: 1638312795775,
          id: 'MwYNsOKeWEESI-mU83Uhu',
          originalUnit: '',
          type: 'timeseries',
          description: '-',
          range: [0.00226, 0.00307],
          tsId: 4582687667743262,
          enabled: true,
          lineWeight: 1,
          color: '#6929c4',
          unit: '',
          name: 'VAL_21_PI_1017_04:Z.X.Value',
          lineStyle: 'solid',
        },
      ],
      name: 'New chart',
      updatedAt: 1638312944960,
      dateTo: '2021-11-03T00:10:58.805Z',
      workflowCollection: [
        {
          unit: '',
          color: '#1192e8',
          lineStyle: 'solid',
          id: 'eBzGAw9mryWQ2KFe4sCzG',
          version: 'v2',
          type: 'workflow',
          enabled: true,
          calls: [],
          preferredUnit: '',
          name: 'Calc 1 (is circular)',
          createdAt: 1638312804162,
          flow: {
            position: [71, 0],
            zoom: 1,
            elements: [
              {
                type: 'CalculationOutput',
                id: '8vmH2Yc2vmp0kDyVl_maz',
                position: {
                  y: 150,
                  x: 543,
                },
              },
              {
                position: {
                  x: 93,
                  y: 131,
                },
                id: 'g_X7eYdvT9OPio9fRr1WG',
                data: {
                  selectedSourceId: 'Ym65GbbAVPtCy-NgvnDZP',
                  type: 'workflow',
                },
                type: 'CalculationInput',
              },
              {
                id: 'reactflow__edge-g_X7eYdvT9OPio9fRr1WGresult-8vmH2Yc2vmp0kDyVl_mazdatapoints',
                sourceHandle: 'result',
                target: '8vmH2Yc2vmp0kDyVl_maz',
                targetHandle: 'datapoints',
                source: 'g_X7eYdvT9OPio9fRr1WG',
              },
            ],
          },
          lineWeight: 1,
        },
        {
          lineWeight: 1,
          flow: {
            position: [0, 0],
            zoom: 1,
            elements: [
              {
                type: 'CalculationOutput',
                id: 'qtWw72uMl9p5EWhwZYL2O',
                position: {
                  x: 614,
                  y: 126,
                },
              },
              {
                position: {
                  x: 56,
                  y: 163,
                },
                type: 'CalculationInput',
                id: 'Q9ZePQ9W7vtu7UHgB5Nu8',
                data: {
                  selectedSourceId: 'eBzGAw9mryWQ2KFe4sCzG',
                  type: 'workflow',
                },
              },
              {
                id: 'reactflow__edge-Q9ZePQ9W7vtu7UHgB5Nu8result-qtWw72uMl9p5EWhwZYL2Odatapoints',
                source: 'Q9ZePQ9W7vtu7UHgB5Nu8',
                sourceHandle: 'result',
                target: 'qtWw72uMl9p5EWhwZYL2O',
                targetHandle: 'datapoints',
              },
            ],
          },
          createdAt: 1638312821053,
          enabled: true,
          id: 'II1PYy7l3dMljBRl0Q9lf',
          calls: [],
          name: 'Calc 2',
          preferredUnit: '',
          unit: '',
          lineStyle: 'solid',
          color: '#005d5d',
          version: 'v2',
          type: 'workflow',
        },
        {
          version: 'v2',
          color: '#9f1853',
          name: 'Calc 3',
          lineStyle: 'solid',
          flow: {
            position: [0, 0],
            zoom: 1,
            elements: [
              {
                type: 'CalculationOutput',
                position: {
                  x: 611,
                  y: 150,
                },
                id: 'kjY5qc_Bt3SXWuDPZBLnu',
              },
              {
                data: {
                  selectedSourceId: 'II1PYy7l3dMljBRl0Q9lf',
                  type: 'workflow',
                },
                id: 'fODc_cZY6oKHiR7RVp59a',
                type: 'CalculationInput',
                position: {
                  y: 171,
                  x: 168,
                },
              },
              {
                id: 'reactflow__edge-fODc_cZY6oKHiR7RVp59aresult-kjY5qc_Bt3SXWuDPZBLnudatapoints',
                source: 'fODc_cZY6oKHiR7RVp59a',
                targetHandle: 'datapoints',
                sourceHandle: 'result',
                target: 'kjY5qc_Bt3SXWuDPZBLnu',
              },
            ],
          },
          unit: '',
          type: 'workflow',
          enabled: true,
          id: 'Ym65GbbAVPtCy-NgvnDZP',
          calls: [],
          lineWeight: 1,
          preferredUnit: '',
          createdAt: 1638312859692,
        },
      ],
      createdAt: 1638311115528,
      sourceCollection: [
        {
          id: 'Ym65GbbAVPtCy-NgvnDZP',
          type: 'workflow',
        },
        {
          type: 'workflow',
          id: 'II1PYy7l3dMljBRl0Q9lf',
        },
        {
          type: 'workflow',
          id: 'eBzGAw9mryWQ2KFe4sCzG',
        },
        {
          id: 'MwYNsOKeWEESI-mU83Uhu',
          type: 'timeseries',
        },
      ],
      public: false,
      version: 1,
      dateFrom: '2021-10-02T23:11:58.805Z',
      userInfo: {
        id: 'eirik.vullum@cognite.com',
        email: 'eirik.vullum@cognite.com',
        displayName: 'eirik.vullum@cognite.com',
      },
      id: 'zY3ROsJFHtCy04hH4hBzk',
    };

    const workflow = chart.workflowCollection?.[0] as ChartWorkflowV2;
    const { settings } = chart;
    const workflows = chart.workflowCollection as ChartWorkflowV2[];

    const steps = getStepsFromWorkflowReactFlow(workflow, settings, workflows);

    expect(steps).toEqual([
      {
        step: 0,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'ts',
            value: '',
          },
        ],
      },
    ]);
  });

  it('should handle using the same calculation reference as a source multiple times in a calculation', () => {
    const workflows = [
      {
        version: 'v2',
        id: 'kFo_FV7arfuTOhmIiYlhw',
        name: 'Calc 1',
        color: '#005d5d',
        flow: {
          elements: [
            {
              id: 'dhXPgqDjQM_-qbKammNQK',
              type: 'CalculationOutput',
              position: {
                x: 738,
                y: 147,
              },
            },
            {
              id: '9DTF-2YetWJSHNS6XnFDu',
              type: 'CalculationInput',
              data: {
                selectedSourceId: 'D4p8lyEgT0P86-Abc-jh7',
                type: 'timeseries',
              },
              position: {
                x: 187,
                y: 136,
              },
            },
            {
              source: '9DTF-2YetWJSHNS6XnFDu',
              sourceHandle: 'result',
              target: 'dhXPgqDjQM_-qbKammNQK',
              targetHandle: 'datapoints',
              id: 'reactflow__edge-9DTF-2YetWJSHNS6XnFDuresult-dhXPgqDjQM_-qbKammNQKdatapoints',
            },
          ],
          position: [0, -1],
          zoom: 1,
        },
        lineWeight: 1,
        lineStyle: 'solid',
        enabled: true,
        createdAt: 1638391582179,
        unit: '',
        preferredUnit: '',
        type: 'workflow',
        calls: [
          {
            id: 'e40c02b8-a7bb-4641-9ba3-a79170c9d9ab',
            status: 'Pending',
            callId: 'e40c02b8-a7bb-4641-9ba3-a79170c9d9ab',
            callDate: 1638391662262,
            hash: 734472289,
          },
        ],
      },
      {
        version: 'v2',
        id: 'MLoc-AIHZ-xlaiaTB3iCC',
        name: 'Calc 2',
        color: '#9f1853',
        flow: {
          elements: [
            {
              id: 'f5ZOUOyTNXygScVxU8Y0F',
              type: 'CalculationOutput',
              position: {
                x: 620,
                y: 154,
              },
            },
            {
              id: 'T0rxXeu0Xdl0lL5R_FEcA',
              type: 'CalculationInput',
              data: {
                selectedSourceId: 'kFo_FV7arfuTOhmIiYlhw',
                type: 'workflow',
              },
              position: {
                x: 82,
                y: 54,
              },
            },
            {
              id: 'OfDdDuGT3QaUANdY0kY6o',
              type: 'CalculationInput',
              data: {
                selectedSourceId: 'kFo_FV7arfuTOhmIiYlhw',
                type: 'workflow',
              },
              position: {
                x: 76,
                y: 235,
              },
            },
            {
              id: 'J-R87u1PMUdi5CIXM5ove',
              type: 'ToolboxFunction',
              data: {
                toolFunction: {
                  category: 'Operators',
                  description: 'Add any two time series or numbers.',
                  inputs: [
                    {
                      description: null,
                      name: 'Time-series or number.',
                      param: 'a',
                      types: ['ts', 'const'],
                    },
                    {
                      description: null,
                      name: 'Time-series or number.',
                      param: 'b',
                      types: ['ts', 'const'],
                    },
                  ],
                  name: 'Add',
                  op: 'add',
                  outputs: [
                    {
                      description: null,
                      name: 'Sum of both input variables.',
                      types: ['ts', 'const'],
                    },
                  ],
                  parameters: [
                    {
                      default_value: false,
                      description:
                        'Automatically align time stamp  of input time series. Default is False.',
                      name: 'Auto-align',
                      options: null,
                      param: 'align_timesteps',
                      type: 'bool',
                    },
                  ],
                },
                functionData: {},
              },
              position: {
                x: 442,
                y: 115,
              },
            },
            {
              source: 'T0rxXeu0Xdl0lL5R_FEcA',
              sourceHandle: 'result',
              target: 'J-R87u1PMUdi5CIXM5ove',
              targetHandle: 'a',
              id: 'reactflow__edge-T0rxXeu0Xdl0lL5R_FEcAresult-J-R87u1PMUdi5CIXM5ovea',
            },
            {
              source: 'OfDdDuGT3QaUANdY0kY6o',
              sourceHandle: 'result',
              target: 'J-R87u1PMUdi5CIXM5ove',
              targetHandle: 'b',
              id: 'reactflow__edge-OfDdDuGT3QaUANdY0kY6oresult-J-R87u1PMUdi5CIXM5oveb',
            },
            {
              source: 'J-R87u1PMUdi5CIXM5ove',
              sourceHandle: 'out-result',
              target: 'f5ZOUOyTNXygScVxU8Y0F',
              targetHandle: 'datapoints',
              id: 'reactflow__edge-J-R87u1PMUdi5CIXM5oveout-result-f5ZOUOyTNXygScVxU8Y0Fdatapoints',
            },
          ],
          position: [0, 0],
          zoom: 1,
        },
        lineWeight: 1,
        lineStyle: 'solid',
        enabled: true,
        createdAt: 1638391593172,
        unit: '',
        preferredUnit: '',
        type: 'workflow',
        calls: [],
      },
    ] as ChartWorkflowV2[];

    const workflow = workflows[1];
    const settings = {};

    const steps = getStepsFromWorkflowReactFlow(workflow, settings, workflows);

    expect(steps).toEqual([
      {
        step: 0,
        op: 'add',
        inputs: [
          {
            type: 'ts',
            value: 'D4p8lyEgT0P86-Abc-jh7',
          },
          {
            type: 'ts',
            value: 'D4p8lyEgT0P86-Abc-jh7',
          },
        ],
        params: {},
      },
      {
        step: 1,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'result',
            value: 0,
          },
        ],
      },
    ]);
  });

  it('should handle using the same calculation reference as a source multiple times in a calculation (2)', () => {
    const workflows = workflowCollectionMock3;

    const workflow = workflows[2];
    const settings = {};

    const steps = getStepsFromWorkflowReactFlow(workflow, settings, workflows);

    expect(steps).toEqual([
      {
        step: 0,
        op: 'add',
        inputs: [
          {
            type: 'ts',
            value: 'D4p8lyEgT0P86-Abc-jh7',
          },
          {
            type: 'ts',
            value: 'D4p8lyEgT0P86-Abc-jh7',
          },
        ],
        params: {},
      },
      {
        step: 1,
        op: 'add',
        inputs: [
          {
            type: 'ts',
            value: 'D4p8lyEgT0P86-Abc-jh7',
          },
          {
            type: 'ts',
            value: 'D4p8lyEgT0P86-Abc-jh7',
          },
        ],
        params: {},
      },
      {
        step: 2,
        op: 'clip',
        inputs: [
          {
            type: 'result',
            value: 0,
          },
        ],
        params: {
          low: -20,
          high: 10,
        },
      },
      {
        step: 3,
        op: 'add',
        inputs: [
          {
            type: 'result',
            value: 2,
          },
          {
            type: 'result',
            value: 0,
          },
        ],
        params: {},
      },
      {
        step: 4,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'result',
            value: 3,
          },
        ],
      },
    ]);
  });
});
