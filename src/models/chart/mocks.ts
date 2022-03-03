import {
  OperationInputsTypesEnum,
  OperationOutputsTypesEnum,
  OperationParametersTypeEnum,
} from '@cognite/calculation-backend';
import { Chart, ChartWorkflowV2 } from './types';

export const emptyWorkflow: ChartWorkflowV2 = {
  name: 'Test Calculation',
  range: [0.00121811464793258, 0.004798625564858012],
  type: 'workflow',
  statisticsCalls: [],
  createdAt: 1638148032268,
  enabled: true,
  id: 'uZZ2AvDqqhsSe-RjPUS-0',
  preferredUnit: '',
  flow: {
    zoom: 1,
    elements: [],
    position: [0, 0],
  },
  version: 'v2',
  settings: { autoAlign: true },
  unit: '',
  calls: [],
  lineWeight: 1,
  color: '#1192e8',
  lineStyle: 'solid',
};

export const chartWithEmptyCalculation: Chart = {
  public: false,
  settings: {
    showGridlines: true,
    autoAlign: false,
    mergeUnits: false,
    showYAxis: true,
    showMinMax: false,
  },
  id: 'TtYz1UIlDLSUnos9mpNqD',
  user: 'eirik.vullum@cognite.com',
  updatedAt: 1638181218806,
  workflowCollection: [
    {
      name: 'Calculation 1',
      range: [0.00121811464793258, 0.004798625564858012],
      type: 'workflow',
      statisticsCalls: [
        {
          callDate: 1638175496831,
          hash: -2025485385,
          callId: 'ac17383b-4686-43d4-8d75-d8f2ac81c3c5',
        },
      ],
      createdAt: 1638148032268,
      enabled: true,
      id: 'uZZ2AvDqqhsSe-RjPUS-0',
      preferredUnit: '',
      flow: {
        zoom: 1,
        elements: [],
        position: [0, 0],
      },
      version: 'v2',
      settings: { autoAlign: true },
      unit: '',
      calls: [
        {
          callDate: 1638177786502,
          hash: 558648747,
          status: 'Pending',
          id: 'c87dcdb6-a8c6-4781-b3b7-fc23e8a927e5',
          callId: 'c87dcdb6-a8c6-4781-b3b7-fc23e8a927e5',
        },
      ],
      lineWeight: 1,
      color: '#1192e8',
      lineStyle: 'solid',
    },
  ],
  dateTo: '2021-11-07T19:27:42.917Z',
  timeSeriesCollection: [
    {
      color: '#6929c4',
      preferredUnit: '',
      enabled: false,
      name: 'VAL_21_PT_1017_04:Z.X.Value',
      lineWeight: 1,
      description: '-',
      originalUnit: '',
      createdAt: 1638125613943,
      id: 'hbzD7cJ6I0tbMJAT_vagV',
      displayMode: 'lines',
      lineStyle: 'solid',
      tsExternalId: 'VAL_21_PT_1017_04:Z.X.Value',
      tsId: 1561976339625775,
      type: 'timeseries',
      range: [0.00226, 0.00307],
      unit: '',
    },
    {
      tsId: 4470513466595936,
      displayMode: 'lines',
      id: 'z4_SabhZ-LQjPx53WhSF5',
      lineWeight: 1,
      description: '-',
      type: 'timeseries',
      name: 'VAL_21_PT_1019_04:Z.X.Value',
      tsExternalId: 'VAL_21_PT_1019_04:Z.X.Value',
      unit: '',
      enabled: false,
      preferredUnit: '',
      range: [0.00226, 0.00307],
      lineStyle: 'solid',
      createdAt: 1638125615360,
      color: '#1192e8',
      originalUnit: '',
    },
    {
      lineWeight: 1,
      color: '#570408',
      type: 'timeseries',
      lineStyle: 'solid',
      enabled: false,
      displayMode: 'lines',
      name: 'VAL_21_PI_1017_04:Z.X.Value',
      tsExternalId: 'VAL_21_PI_1017_04:Z.X.Value',
      description: '-',
      range: [0.00226, 0.00306],
      id: 'bHi5m84gI7hwFnPbQQ1BQ',
      tsId: 4582687667743262,
      originalUnit: '',
      createdAt: 1638134354068,
      unit: '',
      preferredUnit: '',
    },
  ],
  version: 1,
  userInfo: {
    email: 'eirik.vullum@cognite.com',
    id: 'eirik.vullum@cognite.com',
    displayName: 'eirik.vullum@cognite.com',
  },
  sourceCollection: [
    {
      type: 'workflow',
      id: '8Gqmqm69UK5mLoOW7PsJg',
    },
    {
      type: 'workflow',
      id: 'terEW2LnAFlU-XPC0UeNR',
    },
    {
      id: '2M_k0eYSYiU0w7olxpxKy',
      type: 'workflow',
    },
    {
      type: 'workflow',
      id: 'uZZ2AvDqqhsSe-RjPUS-0',
    },
    {
      id: 'bHi5m84gI7hwFnPbQQ1BQ',
      type: 'timeseries',
    },
    {
      id: 'z4_SabhZ-LQjPx53WhSF5',
      type: 'timeseries',
    },
    {
      type: 'timeseries',
      id: 'hbzD7cJ6I0tbMJAT_vagV',
    },
  ],
  name: 'React Flow Test 2',
  dateFrom: '2021-11-06T22:55:45.206Z',
  createdAt: 1638125592612,
};

export const chartWithMultipleCalculations: Chart = {
  public: false,
  settings: {
    showGridlines: true,
    autoAlign: false,
    mergeUnits: false,
    showYAxis: true,
    showMinMax: false,
  },
  id: 'TtYz1UIlDLSUnos9mpNqD',
  user: 'eirik.vullum@cognite.com',
  updatedAt: 1638181218806,
  workflowCollection: [
    {
      name: 'Calculation 1',
      range: [0.00121811464793258, 0.004798625564858012],
      type: 'workflow',
      statisticsCalls: [
        {
          callDate: 1638175496831,
          hash: -2025485385,
          callId: 'ac17383b-4686-43d4-8d75-d8f2ac81c3c5',
        },
      ],
      createdAt: 1638148032268,
      enabled: true,
      id: 'uZZ2AvDqqhsSe-RjPUS-0',
      preferredUnit: '',
      flow: {
        zoom: 1,
        elements: [
          {
            id: 'M6EixG-TP2uGwLRyI-LoU',
            data: {},
            position: {
              x: 591,
              y: 117,
            },
            type: 'CalculationOutput',
          },
          {
            id: 'pdbB_9DJfB3uTNNgBiVUX',
            type: 'CalculationInput',
            position: {
              y: 170,
              x: 177,
            },
            data: {
              type: 'timeseries',
              selectedSourceId: 'z4_SabhZ-LQjPx53WhSF5',
            },
          },
          {
            target: 'M6EixG-TP2uGwLRyI-LoU',
            source: 'pdbB_9DJfB3uTNNgBiVUX',
            sourceHandle: 'result',
            targetHandle: 'datapoints',
            id: 'reactflow__edge-pdbB_9DJfB3uTNNgBiVUXresult-M6EixG-TP2uGwLRyI-LoUdatapoints',
          },
        ],
        position: [0, 0],
      },
      version: 'v2',
      settings: { autoAlign: true },
      unit: '',
      calls: [
        {
          callDate: 1638177786502,
          hash: 558648747,
          status: 'Pending',
          id: 'c87dcdb6-a8c6-4781-b3b7-fc23e8a927e5',
          callId: 'c87dcdb6-a8c6-4781-b3b7-fc23e8a927e5',
        },
      ],
      lineWeight: 1,
      color: '#1192e8',
      lineStyle: 'solid',
    },
    {
      calls: [
        {
          id: 'f3b355fa-35d3-4795-b4d9-0b91cc4c6784',
          status: 'Pending',
          callId: 'f3b355fa-35d3-4795-b4d9-0b91cc4c6784',
          callDate: 1638181293273,
          hash: 92419771,
        },
      ],
      type: 'workflow',
      createdAt: 1638148048781,
      color: '#005d5d',
      enabled: true,
      flow: {
        position: [0, 0],
        zoom: 1,
        elements: [
          {
            data: {},
            type: 'CalculationOutput',
            id: '_jXUDsA3kK4fXQ07ny6n-',
            position: {
              y: 84,
              x: 1015,
            },
          },
          {
            type: 'CalculationInput',
            data: {
              type: 'workflow',
              selectedSourceId: 'uZZ2AvDqqhsSe-RjPUS-0',
            },
            position: {
              x: 44,
              y: 115,
            },
            id: 'HXT9dtVNs59ilxvUCO7Ol',
          },
          {
            data: {
              functionData: {
                wavelet: 'db8',
                level: 2,
              },
              toolFunction: {
                name: 'Wavelet de-noising',
                inputs: [
                  {
                    description:
                      'The data to be filtered. The series must have a pandas.DatetimeIndex.',
                    types: [OperationInputsTypesEnum.Ts],
                    param: 'data',
                    name: 'Time series.',
                  },
                ],
                description:
                  'Wavelets approach to filtering industrial data can be very powerful as it uses a *dual* frequency-time\nrepresentation of the original signal, which allows separating noise frequencies from valuable signal frequencies.\nFor more on wavelet filter or other application see https://en.wikipedia.org/wiki/Wavelet',
                parameters: [
                  {
                    default_value: 2,
                    description:
                      'The number of wavelet decomposition levels (typically 1 through 6) to use.',
                    type: OperationParametersTypeEnum.Int,
                    param: 'level',
                    name: 'Level.',
                    options: null,
                  },
                  {
                    options: [
                      {
                        value: 'db1',
                        label: 'DAUBECHIES_1',
                      },
                      {
                        label: 'DAUBECHIES_2',
                        value: 'db2',
                      },
                      {
                        value: 'db3',
                        label: 'DAUBECHIES_3',
                      },
                      {
                        label: 'DAUBECHIES_4',
                        value: 'db4',
                      },
                      {
                        label: 'DAUBECHIES_5',
                        value: 'db5',
                      },
                      {
                        label: 'DAUBECHIES_6',
                        value: 'db6',
                      },
                      {
                        value: 'db7',
                        label: 'DAUBECHIES_7',
                      },
                      {
                        label: 'DAUBECHIES_8',
                        value: 'db8',
                      },
                      {
                        value: 'sym1',
                        label: 'SYMLETS_1',
                      },
                      {
                        label: 'SYMLETS_2',
                        value: 'sym2',
                      },
                      {
                        label: 'SYMLETS_3',
                        value: 'sym3',
                      },
                      {
                        value: 'sym4',
                        label: 'SYMLETS_4',
                      },
                    ],
                    default_value: 'db8',
                    description:
                      'The default is a Daubechies wavelet of order 8 (*db8*). For other types of wavelets see consult the\n`pywavelets pacakge <https://pywavelets.readthedocs.io/en/latest/ref/wavelets.html>`_.\nThe thresholding methods assume an orthogonal wavelet transform and may not choose the threshold\nappropriately for biorthogonal wavelets. Orthogonal wavelets are desirable because white noise in\nthe input remains white noise in the sub-bands. Therefore one should choose one of the db[1-20], sym[2-20]\nor coif[1-5] type wavelet filters.',
                    name: 'Type.',
                    param: 'wavelet',
                    type: OperationParametersTypeEnum.Str,
                  },
                ],
                op: 'wavelet_filter',
                outputs: [
                  {
                    name: 'Filtered time series',
                    types: [OperationOutputsTypesEnum.Ts],
                    description: null,
                  },
                ],
                category: 'Filter',
              },
            },
            id: 'tA9_ksBh90vpmDi786MgM',
            type: 'ToolboxFunction',
            position: {
              y: 241,
              x: 423,
            },
          },
          {
            id: 'reactflow__edge-HXT9dtVNs59ilxvUCO7Olresult-tA9_ksBh90vpmDi786MgMdata',
            target: 'tA9_ksBh90vpmDi786MgM',
            source: 'HXT9dtVNs59ilxvUCO7Ol',
            targetHandle: 'data',
            sourceHandle: 'result',
          },
          {
            id: 'reactflow__edge-tA9_ksBh90vpmDi786MgMout-result-_jXUDsA3kK4fXQ07ny6n-datapoints',
            target: '_jXUDsA3kK4fXQ07ny6n-',
            source: 'tA9_ksBh90vpmDi786MgM',
            sourceHandle: 'out-result',
            targetHandle: 'datapoints',
          },
        ],
      },
      preferredUnit: '',
      range: [0.002229554809050533, 0.0056663855126161955],
      lineStyle: 'solid',
      name: 'Calculation 2',
      unit: '',
      id: '2M_k0eYSYiU0w7olxpxKy',
      lineWeight: 1,
      statisticsCalls: [
        {
          hash: -255175674,
          callId: 'c76e0346-7051-448c-94e8-07e4af8f0d44',
          callDate: 1638149745370,
        },
      ],
      version: 'v2',
      settings: { autoAlign: true },
    },
    {
      version: 'v2',
      settings: { autoAlign: true },
      preferredUnit: '',
      statisticsCalls: [
        {
          callId: 'a3f0609e-5a67-437d-95db-c2f5a14238fb',
          hash: 516087015,
          callDate: 1638181218767,
        },
      ],
      enabled: true,
      unit: '',
      lineWeight: 1,
      name: 'Calculation 3',
      color: '#9f1853',
      id: 'terEW2LnAFlU-XPC0UeNR',
      flow: {
        position: [0, 0],
        zoom: 1,
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
            data: {
              type: 'workflow',
              selectedSourceId: '2M_k0eYSYiU0w7olxpxKy',
            },
            position: {
              y: 46,
              x: 91,
            },
            type: 'CalculationInput',
          },
          {
            sourceHandle: 'result',
            source: 'rzcuySUBWdmdMTF10ITFK',
            target: 'xDj7A-MswVQsXTyjvNI8U',
            id: 'reactflow__edge-rzcuySUBWdmdMTF10ITFKresult-xDj7A-MswVQsXTyjvNI8Udatapoints',
            targetHandle: 'datapoints',
          },
        ],
      },
      createdAt: 1638148083465,
      range: [0.0012853134080263958, 0.003327958071466366],
      lineStyle: 'solid',
      type: 'workflow',
      calls: [
        {
          id: '75d8af97-8521-4edf-aaaf-8f6faddb53e9',
          status: 'Pending',
          callId: '75d8af97-8521-4edf-aaaf-8f6faddb53e9',
          callDate: 1638181293138,
          hash: 92419771,
        },
      ],
    },
    {
      settings: { autoAlign: true },
      color: '#fa4d56',
      type: 'workflow',
      lineStyle: 'solid',
      calls: [
        {
          callId: 'ba233739-14d4-4e78-9208-cb55665c032e',
          callDate: 1638177786319,
          id: 'ba233739-14d4-4e78-9208-cb55665c032e',
          status: 'Pending',
          hash: 1888642122,
        },
      ],
      preferredUnit: '',
      flow: {
        zoom: 1,
        position: [0, 0],
        elements: [
          {
            id: 'kaH-oiSyg13W23GGt9ZSS',
            type: 'CalculationInput',
            position: {
              y: 70,
              x: 146,
            },
            data: {
              selectedSourceId: 'bHi5m84gI7hwFnPbQQ1BQ',
              type: 'timeseries',
            },
          },
          {
            position: {
              x: 191,
              y: 274,
            },
            type: 'CalculationInput',
            id: 'ItZu2zOAOw5ZDTLvwxaSa',
            data: {
              type: 'timeseries',
              selectedSourceId: 'z4_SabhZ-LQjPx53WhSF5',
            },
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
            position: {
              y: 159,
              x: 560,
            },
            data: {
              functionData: {},
              toolFunction: {
                name: 'Multiplication',
                op: 'mul',
                inputs: [
                  {
                    types: [
                      OperationInputsTypesEnum.Ts,
                      OperationInputsTypesEnum.Const,
                    ],
                    name: 'Time-series or number.',
                    description: null,
                    param: 'a',
                  },
                  {
                    name: 'Time-series or number.',
                    param: 'b',
                    types: [
                      OperationInputsTypesEnum.Ts,
                      OperationInputsTypesEnum.Const,
                    ],
                    description: null,
                  },
                ],
                parameters: [
                  {
                    default_value: false,
                    name: 'Auto-align',
                    param: 'align_timesteps',
                    description:
                      'Automatically align time stamp  of input time series. Default is False.',
                    type: OperationParametersTypeEnum.Bool,
                    options: null,
                  },
                ],
                outputs: [
                  {
                    types: [
                      OperationOutputsTypesEnum.Ts,
                      OperationOutputsTypesEnum.Const,
                    ],
                    name: 'pandas.Series : Multiplication of both input variables.',
                    description: null,
                  },
                ],
                description: 'Multiply two time series or numbers.',
                category: 'Operators',
              },
            },
            type: 'ToolboxFunction',
          },
          {
            targetHandle: 'a',
            id: 'reactflow__edge-ItZu2zOAOw5ZDTLvwxaSaresult-wGmlTDH_iPc39ImqKjGEQa',
            target: 'wGmlTDH_iPc39ImqKjGEQ',
            sourceHandle: 'result',
            source: 'ItZu2zOAOw5ZDTLvwxaSa',
          },
          {
            target: 'wGmlTDH_iPc39ImqKjGEQ',
            source: 'kaH-oiSyg13W23GGt9ZSS',
            targetHandle: 'b',
            sourceHandle: 'result',
            id: 'reactflow__edge-kaH-oiSyg13W23GGt9ZSSresult-wGmlTDH_iPc39ImqKjGEQb',
          },
          {
            target: 'tmCmwAnxL4nKbV2qOqDCy',
            targetHandle: 'datapoints',
            id: 'reactflow__edge-wGmlTDH_iPc39ImqKjGEQout-result-tmCmwAnxL4nKbV2qOqDCydatapoints',
            source: 'wGmlTDH_iPc39ImqKjGEQ',
            sourceHandle: 'out-result',
          },
        ],
      },
      enabled: true,
      lineWeight: 1,
      version: 'v2',
      id: '8Gqmqm69UK5mLoOW7PsJg',
      name: 'Calculation 4',
      createdAt: 1638151790530,
      statisticsCalls: [
        {
          callId: '461f4f36-32bb-49b7-90ca-17e64dcdadbb',
          hash: -1429890709,
          callDate: 1638177789617,
        },
      ],
      unit: '',
    },
  ],
  dateTo: '2021-11-07T19:27:42.917Z',
  timeSeriesCollection: [
    {
      color: '#6929c4',
      preferredUnit: '',
      enabled: false,
      name: 'VAL_21_PT_1017_04:Z.X.Value',
      lineWeight: 1,
      description: '-',
      originalUnit: '',
      createdAt: 1638125613943,
      id: 'hbzD7cJ6I0tbMJAT_vagV',
      displayMode: 'lines',
      lineStyle: 'solid',
      tsExternalId: 'VAL_21_PT_1017_04:Z.X.Value',
      tsId: 1561976339625775,
      type: 'timeseries',
      range: [0.00226, 0.00307],
      unit: '',
    },
    {
      tsId: 4470513466595936,
      displayMode: 'lines',
      id: 'z4_SabhZ-LQjPx53WhSF5',
      lineWeight: 1,
      description: '-',
      type: 'timeseries',
      name: 'VAL_21_PT_1019_04:Z.X.Value',
      tsExternalId: 'VAL_21_PT_1019_04:Z.X.Value',
      unit: '',
      enabled: false,
      preferredUnit: '',
      range: [0.00226, 0.00307],
      lineStyle: 'solid',
      createdAt: 1638125615360,
      color: '#1192e8',
      originalUnit: '',
    },
    {
      lineWeight: 1,
      color: '#570408',
      type: 'timeseries',
      lineStyle: 'solid',
      enabled: false,
      displayMode: 'lines',
      name: 'VAL_21_PI_1017_04:Z.X.Value',
      tsExternalId: 'VAL_21_PI_1017_04:Z.X.Value',
      description: '-',
      range: [0.00226, 0.00306],
      id: 'bHi5m84gI7hwFnPbQQ1BQ',
      tsId: 4582687667743262,
      originalUnit: '',
      createdAt: 1638134354068,
      unit: '',
      preferredUnit: '',
    },
  ],
  version: 1,
  userInfo: {
    email: 'eirik.vullum@cognite.com',
    id: 'eirik.vullum@cognite.com',
    displayName: 'eirik.vullum@cognite.com',
  },
  sourceCollection: [
    {
      type: 'workflow',
      id: 'uZZ2AvDqqhsSe-RjPUS-0',
    },
    {
      id: 'bHi5m84gI7hwFnPbQQ1BQ',
      type: 'timeseries',
    },
    {
      id: 'z4_SabhZ-LQjPx53WhSF5',
      type: 'timeseries',
    },
    {
      type: 'timeseries',
      id: 'hbzD7cJ6I0tbMJAT_vagV',
    },
  ],
  name: 'React Flow Test 2',
  dateFrom: '2021-11-06T22:55:45.206Z',
  createdAt: 1638125592612,
};
