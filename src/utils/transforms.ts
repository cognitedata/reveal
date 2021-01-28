/* eslint camelcase: 0 */

import { StorableNode, Workflow } from 'reducers/workflows';

export type DSPFunction = {
  description: string;
  op: string;
  n_inputs: number;
  n_outputs: number;
  parameters: Record<string, string>;
  type_info: string[][];
};

export type DSPFunctionConfig = {
  input: {
    name: string;
    field: string;
    types: string[];
    pin?: boolean;
  }[];
  output: {
    name: string;
    field: string;
    type: string;
  }[];
};

export function fromDspFunctionToConfig(
  dspFunction: DSPFunction
): DSPFunctionConfig {
  const pins = Array(dspFunction.n_inputs)
    .fill(0)
    .map((_, i) => {
      return {
        name: `Input ${i + 1}`,
        field: `input${i}`,
        types: (dspFunction.type_info[i] || []).map(
          getBlockTypeFromFunctionType
        ),
        pin: true,
      };
    });

  const parameters = Object.keys(dspFunction.parameters).map((param) => {
    return {
      name: param,
      field: param,
      types: [getBlockTypeFromParameterType(dspFunction.parameters[param])],
      pin: false,
    };
  });

  const output = [
    {
      name: 'Output',
      field: 'result',
      type: getBlockTypeFromFunctionType('ts'),
    },
  ];

  return {
    input: [...pins, ...parameters],
    output,
  };
}

export function getBlockTypeFromParameterType(parameterType: string): string {
  switch (parameterType) {
    case 'int':
      return 'CONSTANT';
    default:
      return 'UNKNOWN';
  }
}

export function getBlockTypeFromFunctionType(functionType: string): string {
  switch (functionType) {
    case 'ts':
      return 'TIMESERIES';
    case 'const':
      return 'CONSTANT';
    default:
      return 'UNKNOWN';
  }
}

export function getFunctionTypeFromBlockType(blockType: string): string {
  switch (blockType) {
    case 'TOOLBOX_FUNCTION':
      return 'result';
    case 'TIME_SERIES_REFERENCE':
      return 'ts';
    case 'CONSTANT':
      return 'const';
    default:
      return 'UNKNOWN';
  }
}

export function getInputFromNode(node: StorableNode, allNodes: StorableNode[]) {
  switch (node.functionEffectReference) {
    case 'TOOLBOX_FUNCTION':
      return {
        type: 'result',
        value: allNodes.findIndex((n) => n.id === node.id),
      };
    case 'TIME_SERIES_REFERENCE':
      return {
        type: 'ts',
        value: node.functionData.timeSeriesExternalId,
      };
    case 'CONSTANT':
      return { type: 'const', value: node.functionData.value };
    default:
      return { type: 'unknown', value: 'could not resolve' };
  }
}

export function getStepsFromWorkflow(workflow: Workflow) {
  /**
   * TODO: Filter out nodes that aren't somehow connected to the output (disjoint)
   */
  const steps = workflow.nodes
    .filter((node) => node.functionEffectReference === 'TOOLBOX_FUNCTION')
    .map((node, i, allNodes) => {
      const inputs = node.inputPins
        .map((inputPin: any) => {
          const inputNodeConnection = Object.values(workflow.connections).find(
            (conn) =>
              conn.inputPin.nodeId === node.id &&
              conn.inputPin.pinId === inputPin.id
          );

          if (!inputNodeConnection) {
            return undefined;
          }

          const inputNode = workflow.nodes.find(
            (nd) => nd.id === inputNodeConnection.outputPin.nodeId
          )!;

          return getInputFromNode(inputNode, allNodes);
        })
        .filter(Boolean);

      const { toolFunction, ...parameters } = node.functionData || {};

      return {
        step: i,
        op: node.functionData.toolFunction.op,
        inputs,
        ...(Object.keys(parameters).length ? { params: parameters } : {}),
      };
    });

  return steps;
}

/*

"ercc4MwEfmtJ1QUwZi-F9": {
      "id": "ercc4MwEfmtJ1QUwZi-F9",
      "outputPin": {
        "nodeId": "TIME SERIES-kRm-iZt6uHQaxvEQW4rq1",
        "pinId": "result"
      },
      "inputPin": {
        "nodeId": "Toolbox Function-WlEyTKugPz9_GEjqtXH6A",
        "pinId": "input0"
      }
    },


{
    "steps": [
        {
            "step": 0,
            "op": "SG_SMOOTHER",
            "raw": True,
            "inputs": [{"type": "ts", "value": "tag-001"}],
            "params": {"example-parameter": 1337},
        },
        {
            "step": 1,
            "op": "ADD",
            "inputs": [
                {"type": "result", "value": 0},
                {"type": "ts", "value": "tag-003"},
            ],
        },
        {
            "step": 2,
            "op": "ABS",
            "inputs": [{"type": "result", "value": 1}]},
        {
            "step": 3,
            "op": "DIV",
            "inputs": [
                {"type": "result", "value": 2},
                {"type": "const", "value": 1337},
            ],
        },
    ],
    "start_time": 1609459200000,
    "end_time": 1609545600000,
    "granularity": "5m",
}























{
  "id": "BHuctUetUWIl_qdsAMS0B",
  "name": "New Calculation",
  "nodes": [
    {
      "id": "TIME SERIES-AhZNCNR39xNeYDjsGT5gn",
      "title": "VAL_RESERVOIR_PT_well09",
      "subtitle": "TIME SERIES",
      "color": "#FC2574",
      "icon": "Function",
      "inputPins": [],
      "outputPins": [
        {
          "id": "result",
          "title": "Time Series",
          "type": "TIMESERIES",
          "x": 545.46875,
          "y": 65.390625
        }
      ],
      "functionEffectReference": "TIME_SERIES_REFERENCE",
      "functionData": {
        "timeSeriesExternalId": "VAL_RESERVOIR_PT_well09"
      },
      "x": 241,
      "y": 45.390625,
      "selected": false,
      "width": 304.46875
    },
    {
      "id": "TIME SERIES-kRm-iZt6uHQaxvEQW4rq1",
      "title": "VAL_RESERVOIR_PT_well07",
      "subtitle": "TIME SERIES",
      "color": "#FC2574",
      "icon": "Function",
      "inputPins": [],
      "outputPins": [
        {
          "id": "result",
          "title": "Time Series",
          "type": "TIMESERIES",
          "x": 541.46875,
          "y": 415.390625
        }
      ],
      "functionEffectReference": "TIME_SERIES_REFERENCE",
      "functionData": {
        "timeSeriesExternalId": "VAL_RESERVOIR_PT_well07"
      },
      "x": 237,
      "y": 395.390625,
      "selected": false,
      "width": 304.46875
    },
    {
      "id": "Toolbox Function-xfy9ZNZXlLsi4nH3k02sA",
      "title": "Resamples using aggregate & granularity",
      "subtitle": "Toolbox Function",
      "color": "#9118af",
      "icon": "Function",
      "inputPins": [
        {
          "id": "input0",
          "title": "Input 1",
          "types": [
            "TIMESERIES"
          ],
          "x": 239,
          "y": 196.390625
        }
      ],
      "outputPins": [
        {
          "id": "out-result",
          "title": "Output",
          "type": "TIMESERIES",
          "x": 631.1875,
          "y": 196.390625
        }
      ],
      "functionEffectReference": "TOOLBOX_FUNCTION",
      "functionData": {
        "operation": "RESAMPLE"
      },
      "x": 239,
      "y": 134.390625,
      "selected": false,
      "width": 392.1875
    },
    {
      "id": "Toolbox Function-WlEyTKugPz9_GEjqtXH6A",
      "title": "Resamples using aggregate & granularity",
      "subtitle": "Toolbox Function",
      "color": "#9118af",
      "icon": "Function",
      "inputPins": [
        {
          "id": "input0",
          "title": "Input 1",
          "types": [
            "TIMESERIES"
          ],
          "x": 236,
          "y": 538.390625
        }
      ],
      "outputPins": [
        {
          "id": "out-result",
          "title": "Output",
          "type": "TIMESERIES",
          "x": 628.1875,
          "y": 538.390625
        }
      ],
      "functionEffectReference": "TOOLBOX_FUNCTION",
      "functionData": {
        "operation": "RESAMPLE"
      },
      "x": 236,
      "y": 476.390625,
      "selected": false,
      "width": 392.1875
    },
    {
      "id": "Toolbox Function-GMjQKqHjwKHQe-ZK3v4CJ",
      "title": "Subtraction",
      "subtitle": "Toolbox Function",
      "color": "#9118af",
      "icon": "Function",
      "inputPins": [
        {
          "id": "input0",
          "title": "Input 1",
          "types": [
            "TIMESERIES",
            "CONSTANT"
          ],
          "x": 747,
          "y": 282.390625
        },
        {
          "id": "input1",
          "title": "Input 2",
          "types": [
            "TIMESERIES",
            "CONSTANT"
          ],
          "x": 747,
          "y": 314.390625
        }
      ],
      "outputPins": [
        {
          "id": "out-result",
          "title": "Output",
          "type": "TIMESERIES",
          "x": 921.875,
          "y": 282.390625
        }
      ],
      "functionEffectReference": "TOOLBOX_FUNCTION",
      "functionData": {
        "operation": "SUB"
      },
      "x": 747,
      "y": 220.390625,
      "selected": false,
      "width": 174.875
    },
    {
      "id": "Toolbox Function-lSohUUc3LNpMVJMZzaaNX",
      "title": "Saviztky-Golay Filter (smoother)",
      "subtitle": "Toolbox Function",
      "color": "#9118af",
      "icon": "Function",
      "inputPins": [
        {
          "id": "input0",
          "title": "Input 1",
          "types": [
            "TIMESERIES"
          ],
          "x": 998,
          "y": 315.390625
        }
      ],
      "outputPins": [
        {
          "id": "out-result",
          "title": "Output",
          "type": "TIMESERIES",
          "x": 1317.0625,
          "y": 315.390625
        }
      ],
      "functionEffectReference": "TOOLBOX_FUNCTION",
      "functionData": {
        "operation": "SG_SMOOTHER"
      },
      "x": 998,
      "y": 253.390625,
      "selected": false,
      "width": 319.0625
    },
    {
      "id": "TIMESERIES-d16H3frHPghJn_0mAeJTm",
      "title": "Output",
      "subtitle": "TIMESERIES",
      "color": "#4A67FB",
      "icon": "Icon",
      "outputPins": [],
      "inputPins": [
        {
          "id": "datapoints",
          "title": "Time Series",
          "types": [
            "TIMESERIES"
          ],
          "x": 1395,
          "y": 314.390625
        }
      ],
      "x": 1395,
      "y": 252.390625,
      "selected": false,
      "width": 162
    }
  ],
  "connections": {
    "TlBGvPf8_POK_9Ai9RdRM": {
      "id": "TlBGvPf8_POK_9Ai9RdRM",
      "outputPin": {
        "nodeId": "TIME SERIES-AhZNCNR39xNeYDjsGT5gn",
        "pinId": "result"
      },
      "inputPin": {
        "nodeId": "Toolbox Function-xfy9ZNZXlLsi4nH3k02sA",
        "pinId": "input0"
      }
    },
    "ercc4MwEfmtJ1QUwZi-F9": {
      "id": "ercc4MwEfmtJ1QUwZi-F9",
      "outputPin": {
        "nodeId": "TIME SERIES-kRm-iZt6uHQaxvEQW4rq1",
        "pinId": "result"
      },
      "inputPin": {
        "nodeId": "Toolbox Function-WlEyTKugPz9_GEjqtXH6A",
        "pinId": "input0"
      }
    },
    "PGxXnE-2JhoyNa4b-EONG": {
      "id": "PGxXnE-2JhoyNa4b-EONG",
      "outputPin": {
        "nodeId": "Toolbox Function-xfy9ZNZXlLsi4nH3k02sA",
        "pinId": "out-result"
      },
      "inputPin": {
        "nodeId": "Toolbox Function-GMjQKqHjwKHQe-ZK3v4CJ",
        "pinId": "input0"
      }
    },
    "POtkIeSFWADAeTGTMd3Nk": {
      "id": "POtkIeSFWADAeTGTMd3Nk",
      "outputPin": {
        "nodeId": "Toolbox Function-WlEyTKugPz9_GEjqtXH6A",
        "pinId": "out-result"
      },
      "inputPin": {
        "nodeId": "Toolbox Function-GMjQKqHjwKHQe-ZK3v4CJ",
        "pinId": "input1"
      }
    },
    "0bVednE4MWZxwQxVeLKZX": {
      "id": "0bVednE4MWZxwQxVeLKZX",
      "outputPin": {
        "nodeId": "Toolbox Function-GMjQKqHjwKHQe-ZK3v4CJ",
        "pinId": "out-result"
      },
      "inputPin": {
        "nodeId": "Toolbox Function-lSohUUc3LNpMVJMZzaaNX",
        "pinId": "input0"
      }
    },
    "mLY2xriyJbbw0ggWhyiiC": {
      "id": "mLY2xriyJbbw0ggWhyiiC",
      "outputPin": {
        "nodeId": "Toolbox Function-lSohUUc3LNpMVJMZzaaNX",
        "pinId": "out-result"
      },
      "inputPin": {
        "nodeId": "TIMESERIES-d16H3frHPghJn_0mAeJTm",
        "pinId": "datapoints"
      }
    }
  },
  "latestRun": {
    "status": "SUCCESS",
    "timestamp": 1611762226802,
    "errors": [
      {}
    ],
    "nodeProgress": {
      "TIME SERIES-kRm-iZt6uHQaxvEQW4rq1": {
        "status": "DONE",
        "startTime": 1611762226013,
        "endTime": 1611762226077
      },
      "Toolbox Function-WlEyTKugPz9_GEjqtXH6A": {
        "status": "FAILED",
        "failureMessage": {}
      },
      "TIME SERIES-AhZNCNR39xNeYDjsGT5gn": {
        "status": "DONE",
        "startTime": 1611762226418,
        "endTime": 1611762226517
      },
      "Toolbox Function-xfy9ZNZXlLsi4nH3k02sA": {
        "status": "FAILED",
        "failureMessage": {}
      },
      "Toolbox Function-GMjQKqHjwKHQe-ZK3v4CJ": {
        "status": "WAITING"
      },
      "Toolbox Function-lSohUUc3LNpMVJMZzaaNX": {
        "status": "WAITING"
      }
    }
  }
}







*/
