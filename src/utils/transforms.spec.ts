import { Workflow } from 'reducers/workflows';
import {
  getStepsFromWorkflow,
  getConfigFromDspFunction,
  DSPFunction,
} from './transforms';

describe('getConfigFromDspFunction', () => {
  it('generates correct config from dsp function description (case 1)', () => {
    const dspFunctionDescription: DSPFunction = {
      description: 'Data smoother - Saviztky-Golay Filter',
      n_inputs: 1,
      n_outputs: 1,
      op: 'SG_SMOOTHER',
      parameters: [
        {
          default: null,
          param: 'window_length',
          type: 'int',
        },
        {
          default: 1,
          param: 'polyorder',
          type: 'int',
        },
      ],
      type_info: [['ts']],
    };

    const config = getConfigFromDspFunction(dspFunctionDescription);

    expect(config).toEqual({
      input: [
        {
          name: 'Input 1',
          field: 'input0',
          types: ['TIMESERIES'],
          pin: true,
        },
        {
          name: 'window_length',
          field: 'window_length',
          types: ['CONSTANT'],
          pin: false,
        },
        {
          name: 'polyorder',
          field: 'polyorder',
          types: ['CONSTANT'],
          pin: false,
        },
      ],
      output: [
        {
          name: 'Output',
          field: 'result',
          type: 'TIMESERIES',
        },
      ],
    });
  });

  it('generates correct config from dsp function description (case 2)', () => {
    const dspFunctionDescription: DSPFunction = {
      description: 'Maximum function (element-wise)',
      n_inputs: 2,
      n_outputs: 1,
      op: 'MAX',
      parameters: [],
      type_info: [
        ['ts', 'const'],
        ['ts', 'const'],
      ],
    };

    const config = getConfigFromDspFunction(dspFunctionDescription);

    expect(config).toEqual({
      input: [
        {
          name: 'Input 1',
          field: 'input0',
          types: ['TIMESERIES', 'CONSTANT'],
          pin: true,
        },
        {
          name: 'Input 2',
          field: 'input1',
          types: ['TIMESERIES', 'CONSTANT'],
          pin: true,
        },
      ],
      output: [
        {
          name: 'Output',
          field: 'result',
          type: 'TIMESERIES',
        },
      ],
    });
  });
});

describe('getStepsFromWorkflow', () => {
  it('generates correct steps (empty workflow)', () => {
    const workflow: Workflow = {
      id: 'abc123',
      name: 'Empty workflow',
      nodes: [],
      connections: {},
    };

    const steps = getStepsFromWorkflow(workflow);

    expect(steps).toEqual([]);
  });

  it('generates correct steps (missing output node)', () => {
    const workflow: Workflow = {
      name: 'New Calculation',
      nodes: [
        {
          id: 'TIME SERIES-6TIY4YZcnjxIFv6pYjXEG',
          functionEffectReference: 'TIME_SERIES_REFERENCE',
          color: '#FC2574',
          selected: false,
          outputPins: [
            {
              id: 'result',
              x: 608.421875,
              type: 'TIMESERIES',
              y: -135.609375,
              title: 'Time Series',
            },
          ],
          x: 363,
          subtitle: 'TIME SERIES',
          title: 'Pressure well 1',
          inputPins: [],
          y: -155.609375,
          functionData: {
            timeSeriesExternalId: 'VAL_RESERVOIR_PT_well09',
          },
          width: 245.421875,
          icon: 'Function',
        },
        {
          color: '#FC2574',
          y: 32.390625,
          title: 'Pressure well 2',
          subtitle: 'TIME SERIES',
          selected: false,
          functionData: {
            timeSeriesExternalId: 'VAL_RESERVOIR_PT_well07',
          },
          outputPins: [
            {
              x: 634.421875,
              type: 'TIMESERIES',
              id: 'result',
              title: 'Time Series',
              y: 52.390625,
            },
          ],
          width: 245.421875,
          icon: 'Function',
          inputPins: [],
          id: 'TIME SERIES-B7TPWUsG22UkYz7skhLrI',
          x: 389,
          functionEffectReference: 'TIME_SERIES_REFERENCE',
        },
        {
          id: 'Constant-zVAk0aNDin5gSrYQo7RuG',
          functionEffectReference: 'CONSTANT',
          outputPins: [
            {
              type: 'CONSTANT',
              y: -90.609375,
              x: 950.046875,
              id: 'result',
              title: 'Constant',
            },
          ],
          title: '100',
          icon: 'Function',
          x: 816,
          selected: false,
          inputPins: [],
          functionData: {
            value: 100,
          },
          width: 134.046875,
          y: -110.609375,
          color: '#FC2574',
          subtitle: 'Constant',
        },
        {
          inputPins: [
            {
              types: ['TIMESERIES', 'CONSTANT'],
              id: 'input0',
              title: 'Input 1',
            },
            {
              title: 'Input 2',
              types: ['TIMESERIES', 'CONSTANT'],
              id: 'input1',
            },
          ],
          outputPins: [
            {
              type: 'TIMESERIES',
              title: 'Output',
              id: 'out-result',
            },
          ],
          selected: false,
          title: 'Addition',
          functionData: {
            toolFunction: {
              parameters: [],
              n_outputs: 1,
              op: 'ADD',
              n_inputs: 2,
              description: 'Addition',
            },
          },
          id: 'Toolbox Function-t5g8fe40UfwADRcDxepmm',
          width: 198.09375,
          color: '#9118af',
          icon: 'Function',
          y: 107.390625,
          subtitle: 'Toolbox Function',
          x: 774,
          functionEffectReference: 'TOOLBOX_FUNCTION',
        },
        {
          functionData: {
            toolFunction: {
              parameters: [],
              n_outputs: 1,
              description: 'Addition',
              n_inputs: 2,
              op: 'ADD',
            },
          },
          width: 198.09375,
          color: '#9118af',
          functionEffectReference: 'TOOLBOX_FUNCTION',
          icon: 'Function',
          title: 'Addition',
          outputPins: [
            {
              title: 'Output',
              type: 'TIMESERIES',
              id: 'out-result',
            },
          ],
          id: 'Toolbox Function-x9We6_hUdoYGNPOM5JHBK',
          subtitle: 'Toolbox Function',
          inputPins: [
            {
              title: 'Input 1',
              id: 'input0',
              types: ['TIMESERIES', 'CONSTANT'],
            },
            {
              id: 'input1',
              title: 'Input 2',
              types: ['TIMESERIES', 'CONSTANT'],
            },
          ],
          x: 1102,
          selected: false,
          y: 7.390625,
        },
      ],
      id: 'KuyBLR-_Bxx0ZZKUohLpo',
      connections: {
        o8HGzvbgKzjHeSxhGP8yR: {
          id: 'o8HGzvbgKzjHeSxhGP8yR',
          outputPin: {
            nodeId: 'TIME SERIES-B7TPWUsG22UkYz7skhLrI',
            pinId: 'result',
          },
          inputPin: {
            nodeId: 'Toolbox Function-t5g8fe40UfwADRcDxepmm',
            pinId: 'input1',
          },
        },
        'klxOGD-GI1ypKfEwWgVD-': {
          outputPin: {
            pinId: 'result',
            nodeId: 'Constant-zVAk0aNDin5gSrYQo7RuG',
          },
          id: 'klxOGD-GI1ypKfEwWgVD-',
          inputPin: {
            nodeId: 'Toolbox Function-x9We6_hUdoYGNPOM5JHBK',
            pinId: 'input0',
          },
        },
        fpTlQCgQltne1TeYD23Tj: {
          inputPin: {
            nodeId: 'Toolbox Function-t5g8fe40UfwADRcDxepmm',
            pinId: 'input0',
          },
          id: 'fpTlQCgQltne1TeYD23Tj',
          outputPin: {
            nodeId: 'TIME SERIES-6TIY4YZcnjxIFv6pYjXEG',
            pinId: 'result',
          },
        },
        NoorLUun7_wrBkzsX0cR7: {
          id: 'NoorLUun7_wrBkzsX0cR7',
          inputPin: {
            nodeId: 'Toolbox Function-x9We6_hUdoYGNPOM5JHBK',
            pinId: 'input1',
          },
          outputPin: {
            pinId: 'out-result',
            nodeId: 'Toolbox Function-t5g8fe40UfwADRcDxepmm',
          },
        },
      },
    };

    const steps = getStepsFromWorkflow(workflow);

    expect(steps).toEqual([]);
  });

  it('generates correct steps (multistep computation)', () => {
    const workflow: Workflow = {
      nodes: [
        {
          inputPins: [],
          width: 304.46875,
          y: -163.609375,
          functionData: {
            timeSeriesExternalId: 'VAL_RESERVOIR_PT_well01',
          },
          functionEffectReference: 'TIME_SERIES_REFERENCE',
          subtitle: 'TIME SERIES',
          outputPins: [
            {
              type: 'TIMESERIES',
              id: 'result',
              x: 486.46875,
              title: 'Time Series',
              y: -143.609375,
            },
          ],
          icon: 'Function',
          selected: false,
          id: 'TIME SERIES-krihrlBzGmwCbf9pRuM-r',
          color: '#FC2574',
          title: 'VAL_RESERVOIR_PT_well01',
          x: 182,
        },
        {
          functionData: {
            timeSeriesExternalId: 'VAL_RESERVOIR_PT_well07',
          },
          functionEffectReference: 'TIME_SERIES_REFERENCE',
          icon: 'Function',
          id: 'TIME SERIES-HJVu23hYmcUu4tOLjcVoF',
          color: '#FC2574',
          y: 134.390625,
          outputPins: [
            {
              y: 154.390625,
              type: 'TIMESERIES',
              x: 486.46875,
              title: 'Time Series',
              id: 'result',
            },
          ],
          width: 304.46875,
          inputPins: [],
          subtitle: 'TIME SERIES',
          title: 'VAL_RESERVOIR_PT_well07',
          x: 182,
          selected: false,
        },
        {
          color: '#9118af',
          inputPins: [
            {
              y: 9.390625,
              types: ['TIMESERIES'],
              x: 288,
              id: 'input0',
              title: 'Input 1',
            },
          ],
          y: -52.609375,
          selected: false,
          functionData: {
            toolFunction: {
              op: 'RESAMPLE',
              description: 'Resamples using aggregate & granularity',
              parameters: [],
              n_outputs: 1,
              n_inputs: 1,
            },
          },
          x: 288,
          outputPins: [
            {
              type: 'TIMESERIES',
              title: 'Output',
              y: 9.390625,
              id: 'out-result',
              x: 680.1875,
            },
          ],
          title: 'Resamples using aggregate & granularity',
          icon: 'Function',
          width: 392.1875,
          subtitle: 'Toolbox Function',
          functionEffectReference: 'TOOLBOX_FUNCTION',
          id: 'Toolbox Function-6o-nfvVU64nG5MrVlvCGI',
        },
        {
          color: '#9118af',
          selected: false,
          outputPins: [
            {
              y: 304.390625,
              type: 'TIMESERIES',
              x: 687.1875,
              id: 'out-result',
              title: 'Output',
            },
          ],
          icon: 'Function',
          width: 392.1875,
          inputPins: [
            {
              types: ['TIMESERIES'],
              title: 'Input 1',
              id: 'input0',
              x: 295,
              y: 304.390625,
            },
          ],
          x: 295,
          subtitle: 'Toolbox Function',
          id: 'Toolbox Function-NJ8GSsEP2JoEfVcBy1S4e',
          title: 'Resamples using aggregate & granularity',
          functionData: {
            toolFunction: {
              n_outputs: 1,
              n_inputs: 1,
              op: 'RESAMPLE',
              description: 'Resamples using aggregate & granularity',
              parameters: [],
            },
          },
          functionEffectReference: 'TOOLBOX_FUNCTION',
          y: 242.390625,
        },
        {
          subtitle: 'Toolbox Function',
          inputPins: [
            {
              x: 770,
              types: ['TIMESERIES', 'CONSTANT'],
              id: 'input0',
              title: 'Input 1',
              y: 126.390625,
            },
            {
              title: 'Input 2',
              types: ['TIMESERIES', 'CONSTANT'],
              y: 158.390625,
              x: 770,
              id: 'input1',
            },
          ],
          selected: false,
          width: 174.875,
          color: '#9118af',
          title: 'Subtraction',
          x: 770,
          functionData: {
            toolFunction: {
              description: 'Subtraction',
              n_outputs: 1,
              op: 'SUB',
              n_inputs: 2,
              parameters: [],
            },
          },
          functionEffectReference: 'TOOLBOX_FUNCTION',
          icon: 'Function',
          id: 'Toolbox Function-j3rRv_uihGbwdW75WmD6t',
          y: 64.390625,
          outputPins: [
            {
              y: 126.390625,
              title: 'Output',
              type: 'TIMESERIES',
              id: 'out-result',
              x: 944.875,
            },
          ],
        },
        {
          color: '#4A67FB',
          selected: false,
          y: 72.390625,
          x: 1425,
          icon: 'Icon',
          inputPins: [
            {
              y: 134.390625,
              types: ['TIMESERIES'],
              title: 'Time Series',
              id: 'datapoints',
              x: 1425,
            },
          ],
          subtitle: 'TIMESERIES',
          width: 162,
          outputPins: [],
          id: 'TIMESERIES-xalz43XcGFrlaP2-hngHN',
          title: 'Output',
        },
        {
          color: '#9118af',
          inputPins: [
            {
              y: -25.609375,
              id: 'input0',
              types: ['TIMESERIES'],
              x: 996,
              title: 'Input 1',
            },
          ],
          subtitle: 'Toolbox Function',
          selected: false,
          title: 'Data smoother - Saviztky-Golay Filter',
          width: 361.09375,
          x: 996,
          outputPins: [
            {
              type: 'TIMESERIES',
              x: 1357.09375,
              id: 'out-result',
              y: -25.609375,
              title: 'Output',
            },
          ],
          functionData: {
            window_length: 10,
            toolFunction: {
              n_outputs: 1,
              parameters: [
                {
                  param: 'window_length',
                  type: 'int',
                  default: null,
                },
                {
                  param: 'polyorder',
                  type: 'int',
                  default: 1,
                },
              ],
              description: 'Data smoother - Saviztky-Golay Filter',
              n_inputs: 1,
              op: 'SG_SMOOTHER',
            },
            polyorder: 2,
          },
          y: -87.609375,
          id: 'Toolbox Function-d7OWoHOWyiAjaICV-QkMh',
          functionEffectReference: 'TOOLBOX_FUNCTION',
          icon: 'Function',
        },
      ],
      id: 'EkIfFAKj7_PkZGyzJqrSG',
      connections: {
        TfhMeTGvtvUc2KZmw1BgY: {
          inputPin: {
            nodeId: 'Toolbox Function-j3rRv_uihGbwdW75WmD6t',
            pinId: 'input1',
          },
          id: 'TfhMeTGvtvUc2KZmw1BgY',
          outputPin: {
            nodeId: 'Toolbox Function-NJ8GSsEP2JoEfVcBy1S4e',
            pinId: 'out-result',
          },
        },
        WqYUrjj9CStAzcQP49tDW: {
          id: 'WqYUrjj9CStAzcQP49tDW',
          inputPin: {
            nodeId: 'Toolbox Function-j3rRv_uihGbwdW75WmD6t',
            pinId: 'input0',
          },
          outputPin: {
            nodeId: 'Toolbox Function-6o-nfvVU64nG5MrVlvCGI',
            pinId: 'out-result',
          },
        },
        qvdGMY4IKd9JpcTAJcXQ8: {
          outputPin: {
            pinId: 'result',
            nodeId: 'TIME SERIES-HJVu23hYmcUu4tOLjcVoF',
          },
          inputPin: {
            nodeId: 'Toolbox Function-NJ8GSsEP2JoEfVcBy1S4e',
            pinId: 'input0',
          },
          id: 'qvdGMY4IKd9JpcTAJcXQ8',
        },
        toKn95HQNvBpH_LPfkvkM: {
          outputPin: {
            nodeId: 'Toolbox Function-j3rRv_uihGbwdW75WmD6t',
            pinId: 'out-result',
          },
          inputPin: {
            nodeId: 'Toolbox Function-d7OWoHOWyiAjaICV-QkMh',
            pinId: 'input0',
          },
          id: 'toKn95HQNvBpH_LPfkvkM',
        },
        Vq1rcwlTRkmGQJr4ltkbQ: {
          id: 'Vq1rcwlTRkmGQJr4ltkbQ',
          outputPin: {
            pinId: 'out-result',
            nodeId: 'Toolbox Function-d7OWoHOWyiAjaICV-QkMh',
          },
          inputPin: {
            pinId: 'datapoints',
            nodeId: 'TIMESERIES-xalz43XcGFrlaP2-hngHN',
          },
        },
        G4mvHmzd_QyUWH0lldbxg: {
          inputPin: {
            pinId: 'input0',
            nodeId: 'Toolbox Function-6o-nfvVU64nG5MrVlvCGI',
          },
          outputPin: {
            pinId: 'result',
            nodeId: 'TIME SERIES-krihrlBzGmwCbf9pRuM-r',
          },
          id: 'G4mvHmzd_QyUWH0lldbxg',
        },
      },
      name: 'New Calculation',
    };

    const steps = getStepsFromWorkflow(workflow);

    expect(steps).toEqual([
      {
        step: 0,
        op: 'RESAMPLE',
        inputs: [
          {
            type: 'ts',
            value: 'VAL_RESERVOIR_PT_well07',
          },
        ],
      },
      {
        step: 1,
        op: 'RESAMPLE',
        inputs: [
          {
            type: 'ts',
            value: 'VAL_RESERVOIR_PT_well01',
          },
        ],
      },
      {
        step: 2,
        op: 'SUB',
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
        op: 'SG_SMOOTHER',
        inputs: [
          {
            type: 'result',
            value: 2,
          },
        ],
        params: {
          window_length: 10,
          polyorder: 2,
        },
      },
    ]);
  });

  it('generates correct steps (dangling/unconnected nodes)', () => {
    const workflow: Workflow = {
      name: 'New Calculation',
      nodes: [
        {
          functionData: {
            timeSeriesExternalId: 'VAL_RESERVOIR_PT_well01',
          },
          outputPins: [
            {
              id: 'result',
              type: 'TIMESERIES',
              x: 486.46875,
              title: 'Time Series',
              y: -143.609375,
            },
          ],
          subtitle: 'TIME SERIES',
          width: 304.46875,
          y: -163.609375,
          functionEffectReference: 'TIME_SERIES_REFERENCE',
          title: 'VAL_RESERVOIR_PT_well01',
          color: '#FC2574',
          inputPins: [],
          x: 182,
          icon: 'Function',
          id: 'TIME SERIES-krihrlBzGmwCbf9pRuM-r',
          selected: false,
        },
        {
          title: 'VAL_RESERVOIR_PT_well07',
          functionEffectReference: 'TIME_SERIES_REFERENCE',
          y: 134.390625,
          x: 182,
          outputPins: [
            {
              x: 486.46875,
              id: 'result',
              title: 'Time Series',
              type: 'TIMESERIES',
              y: 154.390625,
            },
          ],
          icon: 'Function',
          color: '#FC2574',
          width: 304.46875,
          inputPins: [],
          functionData: {
            timeSeriesExternalId: 'VAL_RESERVOIR_PT_well07',
          },
          id: 'TIME SERIES-HJVu23hYmcUu4tOLjcVoF',
          subtitle: 'TIME SERIES',
          selected: false,
        },
        {
          selected: false,
          color: '#9118af',
          title: 'Resamples using aggregate & granularity',
          functionEffectReference: 'TOOLBOX_FUNCTION',
          icon: 'Function',
          id: 'Toolbox Function-6o-nfvVU64nG5MrVlvCGI',
          width: 392.1875,
          inputPins: [
            {
              x: 288,
              title: 'Input 1',
              id: 'input0',
              y: 9.390625,
              types: ['TIMESERIES'],
            },
          ],
          subtitle: 'Toolbox Function',
          outputPins: [
            {
              id: 'out-result',
              title: 'Output',
              type: 'TIMESERIES',
              x: 680.1875,
              y: 9.390625,
            },
          ],
          functionData: {
            toolFunction: {
              n_inputs: 1,
              op: 'RESAMPLE',
              parameters: [],
              n_outputs: 1,
              description: 'Resamples using aggregate & granularity',
            },
          },
          x: 288,
          y: -52.609375,
        },
        {
          y: 242.390625,
          id: 'Toolbox Function-NJ8GSsEP2JoEfVcBy1S4e',
          color: '#9118af',
          functionEffectReference: 'TOOLBOX_FUNCTION',
          functionData: {
            toolFunction: {
              n_outputs: 1,
              parameters: [],
              op: 'RESAMPLE',
              n_inputs: 1,
              description: 'Resamples using aggregate & granularity',
            },
          },
          width: 392.1875,
          subtitle: 'Toolbox Function',
          icon: 'Function',
          selected: false,
          inputPins: [
            {
              y: 304.390625,
              types: ['TIMESERIES'],
              x: 295,
              id: 'input0',
              title: 'Input 1',
            },
          ],
          title: 'Resamples using aggregate & granularity',
          outputPins: [
            {
              y: 304.390625,
              type: 'TIMESERIES',
              id: 'out-result',
              x: 687.1875,
              title: 'Output',
            },
          ],
          x: 295,
        },
        {
          y: 64.390625,
          icon: 'Function',
          outputPins: [
            {
              y: 126.390625,
              title: 'Output',
              x: 944.875,
              id: 'out-result',
              type: 'TIMESERIES',
            },
          ],
          title: 'Subtraction',
          selected: false,
          functionData: {
            toolFunction: {
              parameters: [],
              op: 'SUB',
              n_inputs: 2,
              description: 'Subtraction',
              n_outputs: 1,
            },
          },
          subtitle: 'Toolbox Function',
          width: 174.875,
          id: 'Toolbox Function-j3rRv_uihGbwdW75WmD6t',
          inputPins: [
            {
              x: 770,
              title: 'Input 1',
              y: 126.390625,
              id: 'input0',
              types: ['TIMESERIES', 'CONSTANT'],
            },
            {
              types: ['TIMESERIES', 'CONSTANT'],
              title: 'Input 2',
              y: 158.390625,
              id: 'input1',
              x: 770,
            },
          ],
          color: '#9118af',
          functionEffectReference: 'TOOLBOX_FUNCTION',
          x: 770,
        },
        {
          width: 162,
          selected: false,
          inputPins: [
            {
              types: ['TIMESERIES'],
              y: 134.390625,
              title: 'Time Series',
              id: 'datapoints',
              x: 1425,
            },
          ],
          subtitle: 'TIMESERIES',
          x: 1425,
          icon: 'Icon',
          outputPins: [],
          color: '#4A67FB',
          y: 72.390625,
          title: 'Output',
          id: 'TIMESERIES-xalz43XcGFrlaP2-hngHN',
        },
        {
          color: '#9118af',
          functionEffectReference: 'TOOLBOX_FUNCTION',
          width: 361.09375,
          id: 'Toolbox Function-d7OWoHOWyiAjaICV-QkMh',
          functionData: {
            window_length: 10,
            polyorder: 2,
            toolFunction: {
              description: 'Data smoother - Saviztky-Golay Filter',
              n_inputs: 1,
              parameters: [
                {
                  type: 'int',
                  default: null,
                  param: 'window_length',
                },
                {
                  default: 1,
                  param: 'polyorder',
                  type: 'int',
                },
              ],
              op: 'SG_SMOOTHER',
              n_outputs: 1,
            },
          },
          title: 'Data smoother - Saviztky-Golay Filter',
          outputPins: [
            {
              y: -25.609375,
              type: 'TIMESERIES',
              x: 1357.09375,
              title: 'Output',
              id: 'out-result',
            },
          ],
          y: -87.609375,
          icon: 'Function',
          selected: false,
          inputPins: [
            {
              id: 'input0',
              y: -25.609375,
              x: 996,
              types: ['TIMESERIES'],
              title: 'Input 1',
            },
          ],
          x: 996,
          subtitle: 'Toolbox Function',
        },
        {
          id: 'Constant-8FZphpaT45r_og9UdsqoE',
          title: '100',
          subtitle: 'Constant',
          color: '#FC2574',
          icon: 'Function',
          inputPins: [],
          outputPins: [
            {
              id: 'result',
              title: 'Constant',
              type: 'CONSTANT',
              x: 1219.046875,
              y: 121.390625,
            },
          ],
          functionEffectReference: 'CONSTANT',
          functionData: {
            value: 100,
          },
          x: 1085,
          y: 101.390625,
          selected: false,
          width: 134.046875,
        },
        {
          id: 'Toolbox Function-hA608KiBik0OvlUb9U6-h',
          title: 'Multiplication',
          subtitle: 'Toolbox Function',
          color: '#9118af',
          icon: 'Function',
          inputPins: [
            {
              id: 'input0',
              title: 'Input 1',
              types: ['TIMESERIES', 'CONSTANT'],
            },
            {
              id: 'input1',
              title: 'Input 2',
              types: ['TIMESERIES', 'CONSTANT'],
            },
          ],
          outputPins: [
            {
              id: 'out-result',
              title: 'Output',
              type: 'TIMESERIES',
            },
          ],
          functionEffectReference: 'TOOLBOX_FUNCTION',
          functionData: {
            toolFunction: {
              description: 'Multiplication',
              n_inputs: 2,
              n_outputs: 1,
              op: 'MUL',
              parameters: [],
            },
          },
          x: 1108,
          y: 206.390625,
          selected: false,
          width: 198.09375,
        },
      ],
      id: 'EkIfFAKj7_PkZGyzJqrSG',
      connections: {
        G4mvHmzd_QyUWH0lldbxg: {
          outputPin: {
            pinId: 'result',
            nodeId: 'TIME SERIES-krihrlBzGmwCbf9pRuM-r',
          },
          inputPin: {
            pinId: 'input0',
            nodeId: 'Toolbox Function-6o-nfvVU64nG5MrVlvCGI',
          },
          id: 'G4mvHmzd_QyUWH0lldbxg',
        },
        qvdGMY4IKd9JpcTAJcXQ8: {
          outputPin: {
            pinId: 'result',
            nodeId: 'TIME SERIES-HJVu23hYmcUu4tOLjcVoF',
          },
          id: 'qvdGMY4IKd9JpcTAJcXQ8',
          inputPin: {
            pinId: 'input0',
            nodeId: 'Toolbox Function-NJ8GSsEP2JoEfVcBy1S4e',
          },
        },
        WqYUrjj9CStAzcQP49tDW: {
          outputPin: {
            nodeId: 'Toolbox Function-6o-nfvVU64nG5MrVlvCGI',
            pinId: 'out-result',
          },
          inputPin: {
            pinId: 'input0',
            nodeId: 'Toolbox Function-j3rRv_uihGbwdW75WmD6t',
          },
          id: 'WqYUrjj9CStAzcQP49tDW',
        },
        Vq1rcwlTRkmGQJr4ltkbQ: {
          outputPin: {
            pinId: 'out-result',
            nodeId: 'Toolbox Function-d7OWoHOWyiAjaICV-QkMh',
          },
          id: 'Vq1rcwlTRkmGQJr4ltkbQ',
          inputPin: {
            pinId: 'datapoints',
            nodeId: 'TIMESERIES-xalz43XcGFrlaP2-hngHN',
          },
        },
        TfhMeTGvtvUc2KZmw1BgY: {
          id: 'TfhMeTGvtvUc2KZmw1BgY',
          outputPin: {
            pinId: 'out-result',
            nodeId: 'Toolbox Function-NJ8GSsEP2JoEfVcBy1S4e',
          },
          inputPin: {
            nodeId: 'Toolbox Function-j3rRv_uihGbwdW75WmD6t',
            pinId: 'input1',
          },
        },
        toKn95HQNvBpH_LPfkvkM: {
          outputPin: {
            pinId: 'out-result',
            nodeId: 'Toolbox Function-j3rRv_uihGbwdW75WmD6t',
          },
          id: 'toKn95HQNvBpH_LPfkvkM',
          inputPin: {
            pinId: 'input0',
            nodeId: 'Toolbox Function-d7OWoHOWyiAjaICV-QkMh',
          },
        },
      },
    };

    const steps = getStepsFromWorkflow(workflow);

    expect(steps).toEqual([
      {
        step: 0,
        op: 'RESAMPLE',
        inputs: [
          {
            type: 'ts',
            value: 'VAL_RESERVOIR_PT_well07',
          },
        ],
      },
      {
        step: 1,
        op: 'RESAMPLE',
        inputs: [
          {
            type: 'ts',
            value: 'VAL_RESERVOIR_PT_well01',
          },
        ],
      },
      {
        step: 2,
        op: 'SUB',
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
        op: 'SG_SMOOTHER',
        inputs: [
          {
            type: 'result',
            value: 2,
          },
        ],
        params: {
          window_length: 10,
          polyorder: 2,
        },
      },
    ]);
  });
});
