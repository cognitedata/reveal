import { ChartWorkflowV2 } from 'models/chart/types';

export const workflowCollectionMock: ChartWorkflowV2[] = [
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
    lineStyle: 'solid',
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
            functionData: {
              wavelet: 'db8',
              level: 2,
            },
            toolFunction: {
              op: 'wavelet_filter',
              outputs: [
                {
                  types: ['ts'],
                  name: 'Filtered time series',
                  description: null,
                },
              ],
              parameters: [
                {
                  description:
                    'The number of wavelet decomposition levels (typically 1 through 6) to use.',
                  param: 'level',
                  type: 'int',
                  name: 'Level.',
                  options: null,
                  default_value: 2,
                },
                {
                  options: [
                    {
                      label: 'DAUBECHIES_1',
                      value: 'db1',
                    },
                    {
                      label: 'DAUBECHIES_2',
                      value: 'db2',
                    },
                    {
                      label: 'DAUBECHIES_3',
                      value: 'db3',
                    },
                    {
                      value: 'db4',
                      label: 'DAUBECHIES_4',
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
                      label: 'SYMLETS_1',
                      value: 'sym1',
                    },
                    {
                      label: 'SYMLETS_2',
                      value: 'sym2',
                    },
                    {
                      value: 'sym3',
                      label: 'SYMLETS_3',
                    },
                    {
                      value: 'sym4',
                      label: 'SYMLETS_4',
                    },
                  ],
                  name: 'Type.',
                  default_value: 'db8',
                  type: 'str',
                  description:
                    'The default is a Daubechies wavelet of order 8 (*db8*). For other types of wavelets see consult the\n`pywavelets pacakge <https://pywavelets.readthedocs.io/en/latest/ref/wavelets.html>`_.\nThe thresholding methods assume an orthogonal wavelet transform and may not choose the threshold\nappropriately for biorthogonal wavelets. Orthogonal wavelets are desirable because white noise in\nthe input remains white noise in the sub-bands. Therefore one should choose one of the db[1-20], sym[2-20]\nor coif[1-5] type wavelet filters.',
                  param: 'wavelet',
                },
              ],
              inputs: [
                {
                  param: 'data',
                  name: 'Time series.',
                  types: ['ts'],
                  description:
                    'The data to be filtered. The series must have a pandas.DatetimeIndex.',
                },
              ],
              name: 'Wavelet de-noising',
              description:
                'Wavelets approach to filtering industrial data can be very powerful as it uses a *dual* frequency-time\nrepresentation of the original signal, which allows separating noise frequencies from valuable signal frequencies.\nFor more on wavelet filter or other application see https://en.wikipedia.org/wiki/Wavelet',
              category: 'Filter',
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
    lineStyle: 'solid',
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
            functionData: {},
            toolFunction: {
              description: 'The difference between two time series or numbers.',
              category: 'Operators',
              parameters: [
                {
                  name: 'Auto-align',
                  options: null,
                  type: 'bool',
                  param: 'align_timesteps',
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  default_value: false,
                },
              ],
              inputs: [
                {
                  types: ['ts', 'const'],
                  name: 'Time-series or number.',
                  description: null,
                  param: 'a',
                },
                {
                  name: 'Time-series or number.',
                  param: 'b',
                  types: ['ts', 'const'],
                  description: null,
                },
              ],
              outputs: [
                {
                  types: ['ts', 'const'],
                  description: null,
                  name: 'Difference between both input variables.',
                },
              ],
              op: 'sub',
              name: 'Subtraction',
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
    lineStyle: 'solid',
  },
];

export const workflowCollectionMock2: ChartWorkflowV2[] = [
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
            toolFunction: {
              description:
                'Wavelets approach to filtering industrial data can be very powerful as it uses a *dual* frequency-time\nrepresentation of the original signal, which allows separating noise frequencies from valuable signal frequencies.\nFor more on wavelet filter or other application see https://en.wikipedia.org/wiki/Wavelet',
              inputs: [
                {
                  types: ['ts'],
                  name: 'Time series.',
                  description:
                    'The data to be filtered. The series must have a pandas.DatetimeIndex.',
                  param: 'data',
                },
              ],
              op: 'wavelet_filter',
              outputs: [
                {
                  types: ['ts'],
                  name: 'Filtered time series',
                  description: null,
                },
              ],
              parameters: [
                {
                  name: 'Level.',
                  default_value: 2,
                  type: 'int',
                  param: 'level',
                  description:
                    'The number of wavelet decomposition levels (typically 1 through 6) to use.',
                  options: null,
                },
                {
                  param: 'wavelet',
                  name: 'Type.',
                  default_value: 'db8',
                  options: [
                    {
                      value: 'db1',
                      label: 'DAUBECHIES_1',
                    },
                    {
                      value: 'db2',
                      label: 'DAUBECHIES_2',
                    },
                    {
                      label: 'DAUBECHIES_3',
                      value: 'db3',
                    },
                    {
                      value: 'db4',
                      label: 'DAUBECHIES_4',
                    },
                    {
                      value: 'db5',
                      label: 'DAUBECHIES_5',
                    },
                    {
                      value: 'db6',
                      label: 'DAUBECHIES_6',
                    },
                    {
                      label: 'DAUBECHIES_7',
                      value: 'db7',
                    },
                    {
                      value: 'db8',
                      label: 'DAUBECHIES_8',
                    },
                    {
                      value: 'sym1',
                      label: 'SYMLETS_1',
                    },
                    {
                      value: 'sym2',
                      label: 'SYMLETS_2',
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
                  type: 'str',
                  description:
                    'The default is a Daubechies wavelet of order 8 (*db8*). For other types of wavelets see consult the\n`pywavelets pacakge <https://pywavelets.readthedocs.io/en/latest/ref/wavelets.html>`_.\nThe thresholding methods assume an orthogonal wavelet transform and may not choose the threshold\nappropriately for biorthogonal wavelets. Orthogonal wavelets are desirable because white noise in\nthe input remains white noise in the sub-bands. Therefore one should choose one of the db[1-20], sym[2-20]\nor coif[1-5] type wavelet filters.',
                },
              ],
              category: 'Filter',
              name: 'Wavelet de-noising',
            },
            functionData: {
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
            toolFunction: {
              category: 'Operators',
              description: 'Multiply two time series or numbers.',
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
              name: 'Multiplication',
              op: 'mul',
              outputs: [
                {
                  description: null,
                  name: 'pandas.Series : Multiplication of both input variables.',
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
];

export const workflowCollectionMock3: ChartWorkflowV2[] = [
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
            functionData: {},
            toolFunction: {
              outputs: [
                {
                  types: ['ts', 'const'],
                  name: 'Sum of both input variables.',
                  description: null,
                },
              ],
              parameters: [
                {
                  description:
                    'Automatically align time stamp  of input time series. Default is False.',
                  name: 'Auto-align',
                  options: null,
                  param: 'align_timesteps',
                  default_value: false,
                  type: 'bool',
                },
              ],
              description: 'Add any two time series or numbers.',
              inputs: [
                {
                  param: 'a',
                  name: 'Time-series or number.',
                  types: ['ts', 'const'],
                  description: null,
                },
                {
                  types: ['ts', 'const'],
                  description: null,
                  name: 'Time-series or number.',
                  param: 'b',
                },
              ],
              name: 'Add',
              category: 'Operators',
              op: 'add',
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
            x: 561.1234705563234,
            y: 93.02134270232074,
          },
        },
        {
          id: 'RYb_k7vapfIgTNdqTdlHU',
          type: 'ToolboxFunction',
          data: {
            toolFunction: {
              category: 'Operators',
              description:
                'Given an interval, values of the timeseries outside the interval are clipped to the interval edges.',
              inputs: [
                {
                  description: null,
                  name: 'time-series',
                  param: 'x',
                  types: ['ts', 'const'],
                },
              ],
              name: 'Clip(low, high)',
              op: 'clip',
              outputs: [
                {
                  description: null,
                  name: 'Clipped version of the input time series',
                  types: ['ts', 'const'],
                },
              ],
              parameters: [
                {
                  default_value: null,
                  description: null,
                  name: 'lower limit of the clipping interval',
                  options: null,
                  param: 'low',
                  type: 'float',
                },
                {
                  default_value: null,
                  description: null,
                  name: 'upper limit of the clipping interval',
                  options: null,
                  param: 'high',
                  type: 'float',
                },
              ],
            },
            functionData: {
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
];
