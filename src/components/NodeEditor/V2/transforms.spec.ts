import { OperationVersionParamsTypeEnum } from '@cognite/calculation-backend';
import { Chart, ChartWorkflowV2 } from 'models/chart/types';
import { fullListOfOperations } from 'models/operations/mocks';
import {
  getStepsFromWorkflowReactFlow,
  transformParamInput,
} from './transforms';

describe('transformParamInput', () => {
  it('transforms a 0 float correctly', () => {
    const testCases: [
      OperationVersionParamsTypeEnum,
      string,
      string | number
    ][] = [
      [OperationVersionParamsTypeEnum.Str, '0', '0'],
      [OperationVersionParamsTypeEnum.Str, 'false', 'false'],
      [OperationVersionParamsTypeEnum.Str, 'true', 'true'],
      [OperationVersionParamsTypeEnum.Str, '12.3245', '12.3245'],
      [OperationVersionParamsTypeEnum.Int, '0', 0],
      [OperationVersionParamsTypeEnum.Int, '12.3245', 12],
      [OperationVersionParamsTypeEnum.Int, 'false', ''],
      [OperationVersionParamsTypeEnum.Float, '0', 0],
      [OperationVersionParamsTypeEnum.Float, '12.345', 12.345],
      [OperationVersionParamsTypeEnum.Float, '1e-6', 0.000001],
      [OperationVersionParamsTypeEnum.Float, '1e6', 1000000],
      [OperationVersionParamsTypeEnum.Float, 'false', ''],
      [OperationVersionParamsTypeEnum.Float, 'true', ''],
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
      settings: { autoAlign: true },
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
      settings: { autoAlign: true },
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
      settings: { autoAlign: true },
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
              parameterValues: {
                granularity: '1h',
                aggregate: 'mean',
              },
              selectedOperation: {
                op: 'resample_to_granularity',
                version: '1.0',
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
              selectedOperation: {
                op: 'resample_to_granularity',
                version: '1.0',
              },
              parameterValues: {
                granularity: '1h',
                aggregate: 'mean',
              },
            },
          },
          {
            type: 'ToolboxFunction',
            data: {
              selectedOperation: {
                op: 'sub',
                version: '1.0',
              },
              parameterValues: {},
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
              selectedOperation: {
                op: 'sg',
                version: '1.0',
              },
              parameterValues: {
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

    const steps = getStepsFromWorkflowReactFlow(
      workflow,
      [workflow],
      fullListOfOperations
    );

    expect(steps).toEqual([
      {
        step: 0,
        op: 'resample_to_granularity',
        version: '1.0',
        inputs: [
          {
            param: 'series',
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
        version: '1.0',
        inputs: [
          {
            param: 'series',
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
        version: '1.0',
        inputs: [
          {
            param: 'a',
            type: 'result',
            value: 1,
          },
          {
            param: 'b',
            type: 'result',
            value: 0,
          },
        ],
        params: {
          align_timesteps: true,
        },
      },
      {
        step: 3,
        op: 'sg',
        version: '1.0',
        inputs: [
          {
            param: 'data',
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
        version: '1.0',
        inputs: [
          {
            param: 'series',
            type: 'result',
            value: 3,
          },
        ],
      },
    ]);
  });

  it('generates correct steps (noop computation)', () => {
    const workflow: ChartWorkflowV2 = {
      settings: { autoAlign: true },
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

    const steps = getStepsFromWorkflowReactFlow(workflow);

    expect(steps).toEqual([
      {
        step: 0,
        op: 'PASSTHROUGH',
        version: '1.0',
        inputs: [
          {
            type: 'ts',
            value: 'RvXihRaJJujRDDFKC4D1-',
            param: 'series',
          },
        ],
      },
    ]);
  });

  it('generates correct steps (dangling nodes)', () => {
    const workflow: ChartWorkflowV2 = {
      settings: { autoAlign: true },
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
              selectedOperation: {
                name: 'Resample to granularity',
                op: 'resample_to_granularity',
                version: '1.0',
              },
              parameterValues: {
                granularity: '1h',
                aggregate: 'mean',
              },
            },
            type: 'ToolboxFunction',
            id: 'a_HOVHQ71v5pXYvV7usq_',
          },
          {
            data: {
              parameterValues: {
                aggregate: 'mean',
                granularity: '1h',
              },
              selectedOperation: {
                op: 'resample_to_granularity',
                version: '1.0',
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
              selectedOperation: {
                op: 'sub',
                version: '1.0',
              },
              parameterValues: {},
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
              selectedOperation: {
                op: 'sg',
                version: '1.0',
              },
              parameterValues: {
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
              selectedOperation: {
                op: 'add',
                version: '1.0',
              },
              parameterValues: {},
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

    const steps = getStepsFromWorkflowReactFlow(
      workflow,
      [workflow],
      fullListOfOperations
    );

    expect(steps).toEqual([
      {
        step: 0,
        op: 'resample_to_granularity',
        version: '1.0',
        inputs: [
          {
            param: 'series',
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
        version: '1.0',
        inputs: [
          {
            param: 'series',
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
        version: '1.0',
        inputs: [
          {
            param: 'a',
            type: 'result',
            value: 1,
          },
          {
            param: 'b',
            type: 'result',
            value: 0,
          },
        ],
        params: {
          align_timesteps: true,
        },
      },
      {
        step: 3,
        op: 'sg',
        version: '1.0',
        inputs: [
          {
            param: 'data',
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
        version: '1.0',
        inputs: [
          {
            param: 'series',
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
                selectedOperation: {
                  op: 'resample_to_granularity',
                  version: '1.0',
                },
                parameterValues: {
                  granularity: '1h',
                  aggregate: 'mean',
                },
              },
              type: 'ToolboxFunction',
              id: 'a_HOVHQ71v5pXYvV7usq_',
            },
            {
              data: {
                parameterValues: {
                  aggregate: 'mean',
                  granularity: '1h',
                },
                selectedOperation: {
                  op: 'resample_to_granularity',
                  name: 'Resample to granularity',
                  version: '1.0',
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
                selectedOperation: {
                  op: 'sub',
                  version: '1.0',
                },
                parameterValues: {},
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
                selectedOperation: {
                  op: 'sg',
                  version: '1.0',
                },
                parameterValues: {
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

    const steps = getStepsFromWorkflowReactFlow(
      workflow,
      workflows,
      fullListOfOperations
    );

    expect(steps).toEqual([
      {
        step: 0,
        op: 'resample_to_granularity',
        version: '1.0',
        inputs: [
          {
            param: 'series',
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
        version: '1.0',
        inputs: [
          {
            param: 'series',
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
        version: '1.0',
        inputs: [
          {
            param: 'a',
            type: 'result',
            value: 1,
          },
          {
            param: 'b',
            type: 'result',
            value: 0,
          },
        ],
        params: {
          align_timesteps: true,
        },
      },
      {
        step: 3,
        op: 'sg',
        version: '1.0',
        inputs: [
          {
            param: 'data',
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
        version: '1.0',
        inputs: [
          {
            param: 'series',
            type: 'result',
            value: 3,
          },
        ],
      },
    ]);
  });

  it('uses correct input order (1)', () => {
    const workflows = [
      {
        range: [0.00121811464793258, 0.004798625564858012],
        type: 'workflow',
        statisticsCalls: [
          {
            callDate: 1638153295256,
            callId: 'f39b170b-2eb3-4337-a527-8522def05fbb',
            hash: 2101351793,
          },
        ],
        color: '#1192e8',
        createdAt: 1638148032268,
        lineWeight: 1,
        settings: { autoAlign: false },
        flow: {
          position: [0, 0],
          zoom: 1,
          elements: [
            {
              position: {
                y: 117,
                x: 591,
              },
              data: {},
              id: 'M6EixG-TP2uGwLRyI-LoU',
              type: 'CalculationOutput',
            },
            {
              id: 'pdbB_9DJfB3uTNNgBiVUX',
              position: {
                y: 170,
                x: 177,
              },
              data: {
                selectedSourceId: 'z4_SabhZ-LQjPx53WhSF5',
                type: 'timeseries',
              },
              type: 'CalculationInput',
            },
            {
              id: 'reactflow__edge-pdbB_9DJfB3uTNNgBiVUXresult-M6EixG-TP2uGwLRyI-LoUdatapoints',
              targetHandle: 'datapoints',
              sourceHandle: 'result',
              target: 'M6EixG-TP2uGwLRyI-LoU',
              source: 'pdbB_9DJfB3uTNNgBiVUX',
            },
          ],
        },
        calls: [
          {
            id: '6148b325-74cd-4a85-af91-d4a7e8b88633',
            status: 'Pending',
            callId: '6148b325-74cd-4a85-af91-d4a7e8b88633',
            callDate: 1638153298313,
            hash: -1106005965,
          },
        ],
        unit: '',
        name: 'Calculation 1',
        id: 'uZZ2AvDqqhsSe-RjPUS-0',
        version: 'v2',
        preferredUnit: '',
        enabled: true,
      },
      {
        statisticsCalls: [
          {
            hash: -255175674,
            callDate: 1638149745370,
            callId: 'c76e0346-7051-448c-94e8-07e4af8f0d44',
          },
        ],
        calls: [
          {
            id: 'd3b5e374-28e3-499c-8279-3eeb72eabdca',
            status: 'Pending',
            callId: 'd3b5e374-28e3-499c-8279-3eeb72eabdca',
            callDate: 1638153298192,
            hash: -1572234941,
          },
        ],
        unit: '',
        range: [0.002229554809050533, 0.0056663855126161955],
        type: 'workflow',
        enabled: true,
        name: 'Calculation 2',
        color: '#005d5d',
        version: 'v2',
        id: '2M_k0eYSYiU0w7olxpxKy',
        settings: { autoAlign: true },
        flow: {
          zoom: 1,
          elements: [
            {
              data: {},
              position: {
                x: 1015,
                y: 84,
              },
              id: '_jXUDsA3kK4fXQ07ny6n-',
              type: 'CalculationOutput',
            },
            {
              type: 'CalculationInput',
              id: 'HXT9dtVNs59ilxvUCO7Ol',
              data: {
                selectedSourceId: 'uZZ2AvDqqhsSe-RjPUS-0',
                type: 'workflow',
              },
              position: {
                x: 44,
                y: 115,
              },
            },
            {
              position: {
                x: 423,
                y: 241,
              },
              type: 'ToolboxFunction',
              data: {
                parameterValues: {
                  wavelet: 'db8',
                  level: 2,
                },
                selectedOperations: {
                  op: 'wavelet_filter',
                  version: '1.0',
                },
              },
              id: 'tA9_ksBh90vpmDi786MgM',
            },
            {
              id: 'reactflow__edge-HXT9dtVNs59ilxvUCO7Olresult-tA9_ksBh90vpmDi786MgMdata',
              sourceHandle: 'result',
              target: 'tA9_ksBh90vpmDi786MgM',
              targetHandle: 'data',
              source: 'HXT9dtVNs59ilxvUCO7Ol',
            },
            {
              targetHandle: 'datapoints',
              id: 'reactflow__edge-tA9_ksBh90vpmDi786MgMout-result-_jXUDsA3kK4fXQ07ny6n-datapoints',
              source: 'tA9_ksBh90vpmDi786MgM',
              target: '_jXUDsA3kK4fXQ07ny6n-',
              sourceHandle: 'out-result',
            },
          ],
          position: [0, 0],
        },
        lineWeight: 1,
        createdAt: 1638148048781,
        preferredUnit: '',
      },
      {
        createdAt: 1638148083465,
        lineStyle: 'solid',
        name: 'Calculation 3',
        settings: { autoAlign: true },
        version: 'v2',
        id: 'terEW2LnAFlU-XPC0UeNR',
        type: 'workflow',
        calls: [
          {
            id: '293ae3f7-715f-46a6-b282-3634a6b6e924',
            status: 'Pending',
            callId: '293ae3f7-715f-46a6-b282-3634a6b6e924',
            callDate: 1638153298070,
            hash: -1572234941,
          },
        ],
        statisticsCalls: [
          {
            callDate: 1638154119849,
            callId: '8c1205ce-6f89-40f5-a7f1-4f1244c265b8',
            hash: 275684321,
          },
        ],
        flow: {
          position: [0, 0],
          zoom: 1,
          elements: [
            {
              position: {
                y: 143,
                x: 843,
              },
              id: 'xDj7A-MswVQsXTyjvNI8U',
              type: 'CalculationOutput',
              data: {},
            },
            {
              position: {
                x: 91,
                y: 46,
              },
              data: {
                selectedSourceId: '2M_k0eYSYiU0w7olxpxKy',
                type: 'workflow',
              },
              type: 'CalculationInput',
              id: 'rzcuySUBWdmdMTF10ITFK',
            },
            {
              source: 'rzcuySUBWdmdMTF10ITFK',
              id: 'reactflow__edge-rzcuySUBWdmdMTF10ITFKresult-xDj7A-MswVQsXTyjvNI8Udatapoints',
              target: 'xDj7A-MswVQsXTyjvNI8U',
              sourceHandle: 'result',
              targetHandle: 'datapoints',
            },
          ],
        },
        unit: '',
        color: '#9f1853',
        preferredUnit: '',
        lineWeight: 1,
        range: [0.0012853134080263958, 0.003327958071466366],
        enabled: true,
      },
      {
        type: 'workflow',
        preferredUnit: '',
        name: 'New Calculation',
        settings: { autoAlign: true },
        version: 'v2',
        unit: '',
        lineWeight: 1,
        id: '8Gqmqm69UK5mLoOW7PsJg',
        color: '#fa4d56',
        flow: {
          zoom: 1,
          elements: [
            {
              data: {
                selectedSourceId: 'bHi5m84gI7hwFnPbQQ1BQ',
                type: 'timeseries',
              },
              position: {
                y: 100,
                x: 194,
              },
              id: 'kaH-oiSyg13W23GGt9ZSS',
              type: 'CalculationInput',
            },
            {
              data: {
                selectedSourceId: 'z4_SabhZ-LQjPx53WhSF5',
                type: 'timeseries',
              },
              position: {
                x: 223,
                y: 252,
              },
              type: 'CalculationInput',
              id: 'ItZu2zOAOw5ZDTLvwxaSa',
            },
            {
              id: 'tmCmwAnxL4nKbV2qOqDCy',
              data: {},
              type: 'CalculationOutput',
              position: {
                x: 775,
                y: 152,
              },
            },
            {
              id: 'E98pnEDeIkFFYZQTYqzGW',
              data: {
                parameterValues: {},
                selectedOperation: {
                  op: 'sub',
                  version: '1.0',
                },
              },
              type: 'ToolboxFunction',
              position: {
                x: 557,
                y: 163,
              },
            },
            {
              source: 'E98pnEDeIkFFYZQTYqzGW',
              sourceHandle: 'out-result',
              target: 'tmCmwAnxL4nKbV2qOqDCy',
              targetHandle: 'datapoints',
              id: 'reactflow__edge-E98pnEDeIkFFYZQTYqzGWout-result-tmCmwAnxL4nKbV2qOqDCydatapoints',
            },
            {
              source: 'ItZu2zOAOw5ZDTLvwxaSa',
              sourceHandle: 'result',
              target: 'E98pnEDeIkFFYZQTYqzGW',
              targetHandle: 'a',
              id: 'reactflow__edge-ItZu2zOAOw5ZDTLvwxaSaresult-E98pnEDeIkFFYZQTYqzGWa',
            },
            {
              source: 'kaH-oiSyg13W23GGt9ZSS',
              sourceHandle: 'result',
              target: 'E98pnEDeIkFFYZQTYqzGW',
              targetHandle: 'b',
              id: 'reactflow__edge-kaH-oiSyg13W23GGt9ZSSresult-E98pnEDeIkFFYZQTYqzGWb',
            },
          ],
          position: [0, 0],
        },
        statisticsCalls: [
          {
            callDate: 1638154121446,
            callId: '7947d5aa-7da0-4609-ac5f-4040f36e0fe2',
            hash: -1773551472,
          },
        ],
        enabled: true,
        createdAt: 1638151790530,
        calls: [
          {
            id: '60143620-e88d-407d-b4ae-9977d3036e1f',
            status: 'Pending',
            callId: '60143620-e88d-407d-b4ae-9977d3036e1f',
            callDate: 1638153845989,
            hash: -1514543773,
          },
        ],
      },
    ] as ChartWorkflowV2[];

    const workflow = workflows[3];

    const steps = getStepsFromWorkflowReactFlow(
      workflow,
      workflows,
      fullListOfOperations
    );

    expect(steps).toEqual([
      {
        step: 0,
        op: 'sub',
        version: '1.0',
        inputs: [
          {
            param: 'a',
            type: 'ts',
            value: 'z4_SabhZ-LQjPx53WhSF5',
          },
          {
            param: 'b',
            type: 'ts',
            value: 'bHi5m84gI7hwFnPbQQ1BQ',
          },
        ],
        params: {
          align_timesteps: true,
        },
      },
      {
        step: 1,
        op: 'PASSTHROUGH',
        version: '1.0',
        inputs: [
          {
            param: 'series',
            type: 'result',
            value: 0,
          },
        ],
      },
    ]);
  });

  it('uses correct input order (2)', () => {
    const workflows = [
      {
        range: [0.00121811464793258, 0.004798625564858012],
        settings: { autoAlign: true },
        version: 'v2',
        enabled: true,
        lineStyle: 'solid',
        statisticsCalls: [
          {
            hash: 2101351793,
            callDate: 1638153295256,
            callId: 'f39b170b-2eb3-4337-a527-8522def05fbb',
          },
        ],
        color: '#1192e8',
        id: 'uZZ2AvDqqhsSe-RjPUS-0',
        unit: '',
        flow: {
          elements: [
            {
              data: {},
              position: {
                x: 591,
                y: 117,
              },
              id: 'M6EixG-TP2uGwLRyI-LoU',
              type: 'CalculationOutput',
            },
            {
              data: {
                selectedSourceId: 'z4_SabhZ-LQjPx53WhSF5',
                type: 'timeseries',
              },
              id: 'pdbB_9DJfB3uTNNgBiVUX',
              position: {
                x: 177,
                y: 170,
              },
              type: 'CalculationInput',
            },
            {
              id: 'reactflow__edge-pdbB_9DJfB3uTNNgBiVUXresult-M6EixG-TP2uGwLRyI-LoUdatapoints',
              sourceHandle: 'result',
              source: 'pdbB_9DJfB3uTNNgBiVUX',
              target: 'M6EixG-TP2uGwLRyI-LoU',
              targetHandle: 'datapoints',
            },
          ],
          position: [0, 0],
          zoom: 1,
        },
        lineWeight: 1,
        name: 'Calculation 1',
        preferredUnit: '',
        type: 'workflow',
        calls: [
          {
            id: '6148b325-74cd-4a85-af91-d4a7e8b88633',
            callId: '6148b325-74cd-4a85-af91-d4a7e8b88633',
            hash: -1106005965,
            status: 'Pending',
            callDate: 1638153298313,
          },
        ],
        createdAt: 1638148032268,
      },
      {
        range: [0.002229554809050533, 0.0056663855126161955],
        settings: { autoAlign: true },
        version: 'v2',
        calls: [
          {
            id: 'd3b5e374-28e3-499c-8279-3eeb72eabdca',
            status: 'Pending',
            callId: 'd3b5e374-28e3-499c-8279-3eeb72eabdca',
            hash: -1572234941,
            callDate: 1638153298192,
          },
        ],
        createdAt: 1638148048781,
        statisticsCalls: [
          {
            hash: -255175674,
            callDate: 1638149745370,
            callId: 'c76e0346-7051-448c-94e8-07e4af8f0d44',
          },
        ],
        type: 'workflow',
        id: '2M_k0eYSYiU0w7olxpxKy',
        color: '#005d5d',
        unit: '',
        enabled: true,
        preferredUnit: '',
        name: 'Calculation 2',
        lineWeight: 1,
        flow: {
          elements: [
            {
              id: '_jXUDsA3kK4fXQ07ny6n-',
              type: 'CalculationOutput',
              data: {},
              position: {
                x: 1015,
                y: 84,
              },
            },
            {
              position: {
                y: 115,
                x: 44,
              },
              type: 'CalculationInput',
              data: {
                selectedSourceId: 'uZZ2AvDqqhsSe-RjPUS-0',
                type: 'workflow',
              },
              id: 'HXT9dtVNs59ilxvUCO7Ol',
            },
            {
              id: 'tA9_ksBh90vpmDi786MgM',
              type: 'ToolboxFunction',
              position: {
                x: 423,
                y: 241,
              },
              data: {
                selectedOperation: {
                  op: 'wavelet_filter',
                  version: '1.0',
                },
                parameterValues: {
                  wavelet: 'db8',
                  level: 2,
                },
              },
            },
            {
              source: 'HXT9dtVNs59ilxvUCO7Ol',
              target: 'tA9_ksBh90vpmDi786MgM',
              sourceHandle: 'result',
              targetHandle: 'data',
              id: 'reactflow__edge-HXT9dtVNs59ilxvUCO7Olresult-tA9_ksBh90vpmDi786MgMdata',
            },
            {
              sourceHandle: 'out-result',
              source: 'tA9_ksBh90vpmDi786MgM',
              id: 'reactflow__edge-tA9_ksBh90vpmDi786MgMout-result-_jXUDsA3kK4fXQ07ny6n-datapoints',
              targetHandle: 'datapoints',
              target: '_jXUDsA3kK4fXQ07ny6n-',
            },
          ],
          zoom: 1,
          position: [0, 0],
        },
        lineStyle: 'solid',
      },
      {
        settings: { autoAlign: true },
        color: '#9f1853',
        createdAt: 1638148083465,
        range: [0.0012853134080263958, 0.003327958071466366],
        lineWeight: 1,
        statisticsCalls: [
          {
            callId: '8c1205ce-6f89-40f5-a7f1-4f1244c265b8',
            callDate: 1638154119849,
            hash: 275684321,
          },
        ],
        calls: [
          {
            id: '293ae3f7-715f-46a6-b282-3634a6b6e924',
            status: 'Pending',
            callId: '293ae3f7-715f-46a6-b282-3634a6b6e924',
            callDate: 1638153298070,
            hash: -1572234941,
          },
        ],
        flow: {
          elements: [
            {
              position: {
                x: 843,
                y: 143,
              },
              type: 'CalculationOutput',
              id: 'xDj7A-MswVQsXTyjvNI8U',
              data: {},
            },
            {
              id: 'rzcuySUBWdmdMTF10ITFK',
              position: {
                x: 91,
                y: 46,
              },
              type: 'CalculationInput',
              data: {
                selectedSourceId: '2M_k0eYSYiU0w7olxpxKy',
                type: 'workflow',
              },
            },
            {
              target: 'xDj7A-MswVQsXTyjvNI8U',
              source: 'rzcuySUBWdmdMTF10ITFK',
              id: 'reactflow__edge-rzcuySUBWdmdMTF10ITFKresult-xDj7A-MswVQsXTyjvNI8Udatapoints',
              targetHandle: 'datapoints',
              sourceHandle: 'result',
            },
          ],
          zoom: 1,
          position: [0, 0],
        },
        version: 'v2',
        enabled: true,
        name: 'Calculation 3',
        type: 'workflow',
        preferredUnit: '',
        unit: '',
        id: 'terEW2LnAFlU-XPC0UeNR',
        lineStyle: 'solid',
      },
      {
        settings: { autoAlign: true },
        type: 'workflow',
        calls: [],
        statisticsCalls: [
          {
            callDate: 1638155201996,
            callId: '1e92c92d-8997-4596-b596-95bdc37a085c',
            hash: 527619415,
          },
        ],
        enabled: true,
        preferredUnit: '',
        flow: {
          elements: [
            {
              type: 'CalculationInput',
              data: {
                selectedSourceId: 'bHi5m84gI7hwFnPbQQ1BQ',
                type: 'timeseries',
              },
              id: 'kaH-oiSyg13W23GGt9ZSS',
              position: {
                x: 194,
                y: 100,
              },
            },
            {
              position: {
                x: 191,
                y: 274,
              },
              id: 'ItZu2zOAOw5ZDTLvwxaSa',
              data: {
                type: 'timeseries',
                selectedSourceId: 'z4_SabhZ-LQjPx53WhSF5',
              },
              type: 'CalculationInput',
            },
            {
              type: 'CalculationOutput',
              data: {},
              position: {
                y: 152,
                x: 775,
              },
              id: 'tmCmwAnxL4nKbV2qOqDCy',
            },
            {
              id: 'wGmlTDH_iPc39ImqKjGEQ',
              type: 'ToolboxFunction',
              data: {
                selectedOperation: {
                  op: 'mul',
                  version: '1.0',
                },
                functionData: {},
              },
              position: {
                x: 550,
                y: 159,
              },
            },
            {
              source: 'ItZu2zOAOw5ZDTLvwxaSa',
              sourceHandle: 'result',
              target: 'wGmlTDH_iPc39ImqKjGEQ',
              targetHandle: 'a',
              id: 'reactflow__edge-ItZu2zOAOw5ZDTLvwxaSaresult-wGmlTDH_iPc39ImqKjGEQa',
            },
            {
              source: 'kaH-oiSyg13W23GGt9ZSS',
              sourceHandle: 'result',
              target: 'wGmlTDH_iPc39ImqKjGEQ',
              targetHandle: 'b',
              id: 'reactflow__edge-kaH-oiSyg13W23GGt9ZSSresult-wGmlTDH_iPc39ImqKjGEQb',
            },
            {
              source: 'wGmlTDH_iPc39ImqKjGEQ',
              sourceHandle: 'out-result',
              target: 'tmCmwAnxL4nKbV2qOqDCy',
              targetHandle: 'datapoints',
              id: 'reactflow__edge-wGmlTDH_iPc39ImqKjGEQout-result-tmCmwAnxL4nKbV2qOqDCydatapoints',
            },
          ],
          zoom: 1,
          position: [0, 0],
        },
        lineStyle: 'solid',
        name: 'New Calculation',
        id: '8Gqmqm69UK5mLoOW7PsJg',
        unit: '',
        color: '#fa4d56',
        createdAt: 1638151790530,
        version: 'v2',
        lineWeight: 1,
      },
    ] as ChartWorkflowV2[];

    const workflow = workflows[3];

    const steps = getStepsFromWorkflowReactFlow(
      workflow,
      workflows,
      fullListOfOperations
    );

    expect(steps).toEqual([
      {
        step: 0,
        op: 'mul',
        version: '1.0',
        inputs: [
          {
            param: 'a',
            type: 'ts',
            value: 'z4_SabhZ-LQjPx53WhSF5',
          },
          {
            param: 'b',
            type: 'ts',
            value: 'bHi5m84gI7hwFnPbQQ1BQ',
          },
        ],
        params: {
          align_timesteps: true,
        },
      },
      {
        step: 1,
        op: 'PASSTHROUGH',
        version: '1.0',
        inputs: [
          {
            param: 'series',
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
          settings: { autoAlign: true },
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
          settings: { autoAlign: true },
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
          settings: { autoAlign: true },
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
    const workflows = chart.workflowCollection as ChartWorkflowV2[];

    const steps = getStepsFromWorkflowReactFlow(
      workflow,
      workflows,
      fullListOfOperations
    );

    expect(steps).toEqual([
      {
        step: 0,
        op: 'PASSTHROUGH',
        version: '1.0',
        inputs: [
          {
            param: 'series',
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
        settings: { autoAlign: true },
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
        settings: { autoAlign: true },
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
                selectedOperation: {
                  op: 'add',
                  version: '1.0',
                },
                parameterValues: {},
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

    const steps = getStepsFromWorkflowReactFlow(
      workflow,
      workflows,
      fullListOfOperations
    );

    expect(steps).toEqual([
      {
        step: 0,
        op: 'add',
        version: '1.0',
        inputs: [
          {
            param: 'a',
            type: 'ts',
            value: 'D4p8lyEgT0P86-Abc-jh7',
          },
          {
            param: 'b',
            type: 'ts',
            value: 'D4p8lyEgT0P86-Abc-jh7',
          },
        ],
        params: {
          align_timesteps: true,
        },
      },
      {
        step: 1,
        op: 'PASSTHROUGH',
        version: '1.0',
        inputs: [
          {
            param: 'series',
            type: 'result',
            value: 0,
          },
        ],
      },
    ]);
  });

  it('should handle using deleted calculation reference as a source in a calculation', () => {
    const workflows = [
      {
        settings: { autoAlign: true },
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
        settings: { autoAlign: true },
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
                selectedSourceId: 'missing-1',
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
                selectedOperation: {
                  op: 'add',
                  version: '1.0',
                },
                parameterValues: {},
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

    const steps = getStepsFromWorkflowReactFlow(
      workflow,
      workflows,
      fullListOfOperations
    );

    expect(steps).toEqual([
      {
        step: 0,
        op: 'add',
        version: '1.0',
        inputs: [
          {
            param: 'a',
            type: 'ts',
            value: '',
          },
          {
            param: 'b',
            type: 'ts',
            value: 'D4p8lyEgT0P86-Abc-jh7',
          },
        ],
        params: {
          align_timesteps: true,
        },
      },
      {
        step: 1,
        op: 'PASSTHROUGH',
        version: '1.0',
        inputs: [
          {
            param: 'series',
            type: 'result',
            value: 0,
          },
        ],
      },
    ]);
  });

  it('should handle using the same calculation reference as a source multiple times in a calculation (2)', () => {
    const workflows = [
      {
        calls: [
          {
            hash: 734472289,
            callId: 'e40c02b8-a7bb-4641-9ba3-a79170c9d9ab',
            callDate: 1638391662262,
            id: 'e40c02b8-a7bb-4641-9ba3-a79170c9d9ab',
            status: 'Pending',
          },
        ],
        color: '#005d5d',
        type: 'workflow',
        lineWeight: 1,
        name: 'Calc 1',
        settings: { autoAlign: true },
        flow: {
          zoom: 1,
          elements: [
            {
              position: {
                x: 738,
                y: 147,
              },
              id: 'dhXPgqDjQM_-qbKammNQK',
              type: 'CalculationOutput',
            },
            {
              data: {
                type: 'timeseries',
                selectedSourceId: 'D4p8lyEgT0P86-Abc-jh7',
              },
              position: {
                x: 187,
                y: 136,
              },
              type: 'CalculationInput',
              id: '9DTF-2YetWJSHNS6XnFDu',
            },
            {
              source: '9DTF-2YetWJSHNS6XnFDu',
              targetHandle: 'datapoints',
              target: 'dhXPgqDjQM_-qbKammNQK',
              sourceHandle: 'result',
              id: 'reactflow__edge-9DTF-2YetWJSHNS6XnFDuresult-dhXPgqDjQM_-qbKammNQKdatapoints',
            },
          ],
          position: [0, -1],
        },
        version: 'v2',
        createdAt: 1638391582179,
        preferredUnit: '',
        enabled: false,
        lineStyle: 'solid',
        id: 'kFo_FV7arfuTOhmIiYlhw',
        unit: '',
      },
      {
        settings: { autoAlign: true },
        lineStyle: 'solid',
        version: 'v2',
        type: 'workflow',
        calls: [
          {
            id: 'b7a43068-39e1-468c-bc22-b1b2f106c6fe',
            status: 'Pending',
            callId: 'b7a43068-39e1-468c-bc22-b1b2f106c6fe',
            callDate: 1638392847096,
            hash: 379881243,
          },
        ],
        name: 'Calc 2',
        color: '#9f1853',
        flow: {
          elements: [
            {
              position: {
                x: 669,
                y: 129,
              },
              id: 'f5ZOUOyTNXygScVxU8Y0F',
              type: 'CalculationOutput',
            },
            {
              type: 'CalculationInput',
              data: {
                type: 'workflow',
                selectedSourceId: 'kFo_FV7arfuTOhmIiYlhw',
              },
              position: {
                y: 54,
                x: 82,
              },
              id: 'T0rxXeu0Xdl0lL5R_FEcA',
            },
            {
              position: {
                y: 235,
                x: 76,
              },
              data: {
                type: 'workflow',
                selectedSourceId: 'kFo_FV7arfuTOhmIiYlhw',
              },
              type: 'CalculationInput',
              id: 'OfDdDuGT3QaUANdY0kY6o',
            },
            {
              data: {
                parameterValues: {},
                selectedOperation: {
                  op: 'add',
                  version: '1.0',
                },
              },
              id: 'J-R87u1PMUdi5CIXM5ove',
              position: {
                x: 442,
                y: 115,
              },
              type: 'ToolboxFunction',
            },
            {
              id: 'reactflow__edge-T0rxXeu0Xdl0lL5R_FEcAresult-J-R87u1PMUdi5CIXM5ovea',
              sourceHandle: 'result',
              targetHandle: 'a',
              source: 'T0rxXeu0Xdl0lL5R_FEcA',
              target: 'J-R87u1PMUdi5CIXM5ove',
            },
            {
              sourceHandle: 'result',
              targetHandle: 'b',
              source: 'OfDdDuGT3QaUANdY0kY6o',
              id: 'reactflow__edge-OfDdDuGT3QaUANdY0kY6oresult-J-R87u1PMUdi5CIXM5oveb',
              target: 'J-R87u1PMUdi5CIXM5ove',
            },
            {
              targetHandle: 'datapoints',
              id: 'reactflow__edge-J-R87u1PMUdi5CIXM5oveout-result-f5ZOUOyTNXygScVxU8Y0Fdatapoints',
              source: 'J-R87u1PMUdi5CIXM5ove',
              target: 'f5ZOUOyTNXygScVxU8Y0F',
              sourceHandle: 'out-result',
            },
          ],
          position: [109.36107148078212, 8.676490245603276],
          zoom: 0.9958497530944584,
        },
        enabled: false,
        unit: '',
        createdAt: 1638391593172,
        id: 'MLoc-AIHZ-xlaiaTB3iCC',
        preferredUnit: '',
        lineWeight: 1,
      },
      {
        settings: { autoAlign: true },
        version: 'v2',
        id: '3jsKfy1u_CDe0FxfZEt7S',
        name: 'Calc 3',
        color: '#fa4d56',
        flow: {
          elements: [
            {
              id: 'JJ8_ZyWYKaVFrNKOLGzag',
              type: 'CalculationOutput',
              position: {
                x: 732,
                y: 108,
              },
            },
            {
              id: 'pkE6xsPpz66oNTfF2va_5',
              type: 'CalculationInput',
              data: {
                selectedSourceId: 'MLoc-AIHZ-xlaiaTB3iCC',
                type: 'workflow',
              },
              position: {
                x: -3,
                y: 103,
              },
            },
            {
              id: 'xPyoKmrM38UczqiY-w70X',
              type: 'ToolboxFunction',
              data: {
                selectedOperation: {
                  op: 'add',
                  version: '1.0',
                },
                parameterValues: {},
              },
              position: {
                x: 561.1234705563234,
                y: 93.02134270232074,
              },
            },
            {
              id: 'RYb_k7vapfIgTNdqTdlHU',
              type: 'ToolboxFunction',
              data: {
                selectedOperation: {
                  op: 'clip',
                  version: '1.0',
                },
                parameterValues: {
                  low: -20,
                  high: 10,
                },
              },
              position: {
                x: 363.8368868858148,
                y: -28.70426640172097,
              },
            },
            {
              source: 'pkE6xsPpz66oNTfF2va_5',
              sourceHandle: 'result',
              target: 'RYb_k7vapfIgTNdqTdlHU',
              targetHandle: 'x',
              id: 'reactflow__edge-pkE6xsPpz66oNTfF2va_5result-RYb_k7vapfIgTNdqTdlHUx',
            },
            {
              source: 'RYb_k7vapfIgTNdqTdlHU',
              sourceHandle: 'out-result',
              target: 'xPyoKmrM38UczqiY-w70X',
              targetHandle: 'a',
              id: 'reactflow__edge-RYb_k7vapfIgTNdqTdlHUout-result-xPyoKmrM38UczqiY-w70Xa',
            },
            {
              source: 'pkE6xsPpz66oNTfF2va_5',
              sourceHandle: 'result',
              target: 'xPyoKmrM38UczqiY-w70X',
              targetHandle: 'b',
              id: 'reactflow__edge-pkE6xsPpz66oNTfF2va_5result-xPyoKmrM38UczqiY-w70Xb',
            },
            {
              source: 'xPyoKmrM38UczqiY-w70X',
              sourceHandle: 'out-result',
              target: 'JJ8_ZyWYKaVFrNKOLGzag',
              targetHandle: 'datapoints',
              id: 'reactflow__edge-xPyoKmrM38UczqiY-w70Xout-result-JJ8_ZyWYKaVFrNKOLGzagdatapoints',
            },
          ],
          position: [4.380201421470304, 93.37370250869199],
          zoom: 0.7856725166675808,
        },
        lineWeight: 1,
        lineStyle: 'solid',
        enabled: true,
        createdAt: 1638393077865,
        unit: '',
        preferredUnit: '',
        type: 'workflow',
        calls: [],
      },
    ] as ChartWorkflowV2[];

    const workflow = workflows[2];

    const steps = getStepsFromWorkflowReactFlow(
      workflow,
      workflows,
      fullListOfOperations
    );

    expect(steps).toEqual([
      {
        step: 0,
        op: 'add',
        version: '1.0',
        inputs: [
          {
            param: 'a',
            type: 'ts',
            value: 'D4p8lyEgT0P86-Abc-jh7',
          },
          {
            param: 'b',
            type: 'ts',
            value: 'D4p8lyEgT0P86-Abc-jh7',
          },
        ],
        params: {
          align_timesteps: true,
        },
      },
      {
        step: 1,
        op: 'add',
        version: '1.0',
        inputs: [
          {
            param: 'a',
            type: 'ts',
            value: 'D4p8lyEgT0P86-Abc-jh7',
          },
          {
            param: 'b',
            type: 'ts',
            value: 'D4p8lyEgT0P86-Abc-jh7',
          },
        ],
        params: {
          align_timesteps: true,
        },
      },
      {
        step: 2,
        op: 'clip',
        version: '1.0',
        inputs: [
          {
            param: 'x',
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
        version: '1.0',
        inputs: [
          {
            param: 'a',
            type: 'result',
            value: 2,
          },
          {
            param: 'b',
            type: 'result',
            value: 0,
          },
        ],
        params: {
          align_timesteps: true,
        },
      },
      {
        step: 4,
        op: 'PASSTHROUGH',
        version: '1.0',
        inputs: [
          {
            param: 'series',
            type: 'result',
            value: 3,
          },
        ],
      },
    ]);
  });

  it('should handle loops in the same calculation', () => {
    const workflows: ChartWorkflowV2[] = [
      {
        version: 'v2',
        id: '54fb2bc2-105f-4802-ac79-134a6ea8685b',
        name: 'New Calculation',
        color: '#005d5d',
        flow: {
          elements: [
            {
              id: '28a7c434-ce09-4e8b-9ec0-1326213d1bed',
              type: 'CalculationOutput',
              position: {
                x: 949,
                y: 121,
              },
            },
            {
              id: 'fa7e9070-aebe-48da-af23-fcc3dc1000ad',
              type: 'CalculationInput',
              data: {
                selectedSourceId: '7ee53164-dc68-44b2-b14a-a772d6a7cbf1',
                type: 'timeseries',
                readOnly: false,
              },
              position: {
                x: 34,
                y: 112,
              },
            },
            {
              id: '09aaf985-25e5-44a5-b261-ab9b8fa7a530',
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
                      name: 'time series',
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
                readOnly: false,
              },
              position: {
                x: 493,
                y: 40,
              },
            },
            {
              id: '8f4ec69e-8748-4ca9-a6fc-90fe3d6bb741',
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
                      name: 'time series',
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
                readOnly: false,
              },
              position: {
                x: 705,
                y: 326,
              },
            },
            {
              source: '8f4ec69e-8748-4ca9-a6fc-90fe3d6bb741',
              sourceHandle: 'out-result-0',
              target: '28a7c434-ce09-4e8b-9ec0-1326213d1bed',
              targetHandle: 'datapoints',
              id: 'reactflow__edge-8f4ec69e-8748-4ca9-a6fc-90fe3d6bb741out-result-0-28a7c434-ce09-4e8b-9ec0-1326213d1beddatapoints',
            },
            {
              source: '09aaf985-25e5-44a5-b261-ab9b8fa7a530',
              sourceHandle: 'out-result-0',
              target: '8f4ec69e-8748-4ca9-a6fc-90fe3d6bb741',
              targetHandle: 'a',
              id: 'reactflow__edge-09aaf985-25e5-44a5-b261-ab9b8fa7a530out-result-0-8f4ec69e-8748-4ca9-a6fc-90fe3d6bb741a',
            },
            {
              source: '8f4ec69e-8748-4ca9-a6fc-90fe3d6bb741',
              sourceHandle: 'out-result-0',
              target: '09aaf985-25e5-44a5-b261-ab9b8fa7a530',
              targetHandle: 'b',
              id: 'reactflow__edge-8f4ec69e-8748-4ca9-a6fc-90fe3d6bb741out-result-0-09aaf985-25e5-44a5-b261-ab9b8fa7a530b',
            },
            {
              source: 'fa7e9070-aebe-48da-af23-fcc3dc1000ad',
              sourceHandle: 'result',
              target: '09aaf985-25e5-44a5-b261-ab9b8fa7a530',
              targetHandle: 'a',
              id: 'reactflow__edge-fa7e9070-aebe-48da-af23-fcc3dc1000adresult-09aaf985-25e5-44a5-b261-ab9b8fa7a530a',
            },
            {
              source: 'fa7e9070-aebe-48da-af23-fcc3dc1000ad',
              sourceHandle: 'result',
              target: '8f4ec69e-8748-4ca9-a6fc-90fe3d6bb741',
              targetHandle: 'b',
              id: 'reactflow__edge-fa7e9070-aebe-48da-af23-fcc3dc1000adresult-8f4ec69e-8748-4ca9-a6fc-90fe3d6bb741b',
            },
          ],
          position: [-15, 18],
          zoom: 1,
        },
        lineWeight: 1,
        lineStyle: 'solid',
        enabled: true,
        createdAt: 1642067130629,
        unit: '',
        preferredUnit: '',
        settings: {
          autoAlign: true,
        },
        type: 'workflow',
        calls: [
          {
            id: '113f441e-a2de-4ad1-8721-c719508baa94',
            status: 'Pending',
            callId: '113f441e-a2de-4ad1-8721-c719508baa94',
            callDate: 1642067304067,
            hash: 1552360245,
          },
        ],
      },
    ];

    const workflow = workflows[0];

    const steps = getStepsFromWorkflowReactFlow(workflow, workflows);

    expect(steps).toEqual([]);
  });

  it('should handle loops in the same calculation (nested)', () => {
    const workflows: ChartWorkflowV2[] = [
      {
        type: 'workflow',
        enabled: true,
        name: 'New Calculation',
        lineWeight: 1,
        settings: {
          autoAlign: true,
        },
        unit: '',
        id: '54fb2bc2-105f-4802-ac79-134a6ea8685b',
        calls: [],
        createdAt: 1642067130629,
        version: 'v2',
        lineStyle: 'solid',
        color: '#005d5d',
        flow: {
          position: [175, 57],
          zoom: 1,
          elements: [
            {
              type: 'CalculationOutput',
              position: {
                y: 121,
                x: 949,
              },
              id: '28a7c434-ce09-4e8b-9ec0-1326213d1bed',
            },
            {
              position: {
                y: 117,
                x: -249,
              },
              data: {
                readOnly: false,
                selectedSourceId: '7ee53164-dc68-44b2-b14a-a772d6a7cbf1',
                type: 'timeseries',
              },
              type: 'CalculationInput',
              id: 'fa7e9070-aebe-48da-af23-fcc3dc1000ad',
            },
            {
              id: '09aaf985-25e5-44a5-b261-ab9b8fa7a530',
              type: 'ToolboxFunction',
              data: {
                readOnly: false,
                functionData: {},
                toolFunction: {
                  description: 'Add any two time series or numbers.',
                  inputs: [
                    {
                      param: 'a',
                      description: null,
                      name: 'Time-series or number.',
                      types: ['ts', 'const'],
                    },
                    {
                      name: 'Time-series or number.',
                      param: 'b',
                      description: null,
                      types: ['ts', 'const'],
                    },
                  ],
                  outputs: [
                    {
                      types: ['ts', 'const'],
                      description: null,
                      name: 'time series',
                    },
                  ],
                  category: 'Operators',
                  name: 'Add',
                  parameters: [
                    {
                      name: 'Auto-align',
                      param: 'align_timesteps',
                      description:
                        'Automatically align time stamp  of input time series. Default is False.',
                      options: null,
                      type: 'bool',
                      default_value: false,
                    },
                  ],
                  op: 'add',
                },
              },
              position: {
                x: 470,
                y: 63,
              },
            },
            {
              data: {
                functionData: {},
                readOnly: false,
                toolFunction: {
                  name: 'Add',
                  op: 'add',
                  parameters: [
                    {
                      name: 'Auto-align',
                      options: null,
                      description:
                        'Automatically align time stamp  of input time series. Default is False.',
                      default_value: false,
                      param: 'align_timesteps',
                      type: 'bool',
                    },
                  ],
                  category: 'Operators',
                  description: 'Add any two time series or numbers.',
                  outputs: [
                    {
                      name: 'time series',
                      description: null,
                      types: ['ts', 'const'],
                    },
                  ],
                  inputs: [
                    {
                      description: null,
                      param: 'a',
                      name: 'Time-series or number.',
                      types: ['ts', 'const'],
                    },
                    {
                      name: 'Time-series or number.',
                      types: ['ts', 'const'],
                      description: null,
                      param: 'b',
                    },
                  ],
                },
              },
              id: '8f4ec69e-8748-4ca9-a6fc-90fe3d6bb741',
              type: 'ToolboxFunction',
              position: {
                x: 778,
                y: 384,
              },
            },
            {
              sourceHandle: 'out-result-0',
              target: '28a7c434-ce09-4e8b-9ec0-1326213d1bed',
              id: 'reactflow__edge-8f4ec69e-8748-4ca9-a6fc-90fe3d6bb741out-result-0-28a7c434-ce09-4e8b-9ec0-1326213d1beddatapoints',
              source: '8f4ec69e-8748-4ca9-a6fc-90fe3d6bb741',
              targetHandle: 'datapoints',
            },
            {
              source: '09aaf985-25e5-44a5-b261-ab9b8fa7a530',
              sourceHandle: 'out-result-0',
              id: 'reactflow__edge-09aaf985-25e5-44a5-b261-ab9b8fa7a530out-result-0-8f4ec69e-8748-4ca9-a6fc-90fe3d6bb741a',
              targetHandle: 'a',
              target: '8f4ec69e-8748-4ca9-a6fc-90fe3d6bb741',
            },
            {
              id: 'reactflow__edge-fa7e9070-aebe-48da-af23-fcc3dc1000adresult-09aaf985-25e5-44a5-b261-ab9b8fa7a530a',
              source: 'fa7e9070-aebe-48da-af23-fcc3dc1000ad',
              targetHandle: 'a',
              target: '09aaf985-25e5-44a5-b261-ab9b8fa7a530',
              sourceHandle: 'result',
            },
            {
              sourceHandle: 'result',
              id: 'reactflow__edge-fa7e9070-aebe-48da-af23-fcc3dc1000adresult-8f4ec69e-8748-4ca9-a6fc-90fe3d6bb741b',
              source: 'fa7e9070-aebe-48da-af23-fcc3dc1000ad',
              target: '8f4ec69e-8748-4ca9-a6fc-90fe3d6bb741',
              targetHandle: 'b',
            },
            {
              id: '02d8cbf5-5f91-4b94-9c6b-435e801b492e',
              data: {
                readOnly: false,
                functionData: {},
                toolFunction: {
                  op: 'add',
                  outputs: [
                    {
                      description: null,
                      name: 'time series',
                      types: ['ts', 'const'],
                    },
                  ],
                  category: 'Operators',
                  parameters: [
                    {
                      options: null,
                      name: 'Auto-align',
                      default_value: false,
                      param: 'align_timesteps',
                      description:
                        'Automatically align time stamp  of input time series. Default is False.',
                      type: 'bool',
                    },
                  ],
                  inputs: [
                    {
                      param: 'a',
                      description: null,
                      name: 'Time-series or number.',
                      types: ['ts', 'const'],
                    },
                    {
                      param: 'b',
                      types: ['ts', 'const'],
                      description: null,
                      name: 'Time-series or number.',
                    },
                  ],
                  name: 'Add',
                  description: 'Add any two time series or numbers.',
                },
              },
              position: {
                y: 305,
                x: 47,
              },
              type: 'ToolboxFunction',
            },
            {
              target: '02d8cbf5-5f91-4b94-9c6b-435e801b492e',
              source: 'fa7e9070-aebe-48da-af23-fcc3dc1000ad',
              targetHandle: 'a',
              id: 'reactflow__edge-fa7e9070-aebe-48da-af23-fcc3dc1000adresult-02d8cbf5-5f91-4b94-9c6b-435e801b492ea',
              sourceHandle: 'result',
            },
            {
              targetHandle: 'b',
              source: '02d8cbf5-5f91-4b94-9c6b-435e801b492e',
              sourceHandle: 'out-result-0',
              id: 'reactflow__edge-02d8cbf5-5f91-4b94-9c6b-435e801b492eout-result-0-09aaf985-25e5-44a5-b261-ab9b8fa7a530b',
              target: '09aaf985-25e5-44a5-b261-ab9b8fa7a530',
            },
            {
              targetHandle: 'b',
              source: '8f4ec69e-8748-4ca9-a6fc-90fe3d6bb741',
              id: 'reactflow__edge-8f4ec69e-8748-4ca9-a6fc-90fe3d6bb741out-result-0-02d8cbf5-5f91-4b94-9c6b-435e801b492eb',
              target: '02d8cbf5-5f91-4b94-9c6b-435e801b492e',
              sourceHandle: 'out-result-0',
            },
          ],
        },
        preferredUnit: '',
      },
    ];

    const workflow = workflows[0];

    const steps = getStepsFromWorkflowReactFlow(workflow, workflows);

    expect(steps).toEqual([]);
  });
});
