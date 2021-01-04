import { DatapointAggregate, DoubleDatapoint } from '@cognite/sdk';
import { StorableNode } from '../types';

type FunctionData = {
  node: any;
};

export const effect = async (
  _: FunctionData,
  a: { datapoints: (DoubleDatapoint | DatapointAggregate)[]; unit: string },
  b: { datapoints: (DoubleDatapoint | DatapointAggregate)[]; unit: string }
) => {
  return {
    result: {
      datapoints: a.datapoints.map((x, index) => ({
        ...x,
        ...('average' in a.datapoints[index]
          ? {
              average:
                ((a.datapoints[index] as DatapointAggregate).average || 0) -
                ((b.datapoints[index] as DatapointAggregate).average || 0),
            }
          : {}),
        ...('value' in a.datapoints[index]
          ? {
              value:
                ((a.datapoints[index] as DoubleDatapoint).value || 0) -
                ((b.datapoints[index] as DoubleDatapoint).value || 0),
            }
          : {}),
      })),
      unit: a.unit,
    },
  };
};

export const effectId = 'DIFFERENCE';

export const node = {
  title: 'DIFFERENCE',
  subtitle: 'A - B',
  color: '#FC2574',
  icon: 'Function',
  outputPins: [
    {
      id: 'result',
      title: 'Result',
      type: 'TIMESERIES',
    },
  ],
  functionEffectReference: effectId,
  inputPins: [
    {
      id: 'input-A',
      title: 'Time Series',
      types: ['TIMESERIES'],
      required: true,
    },
    {
      id: 'input-B',
      title: 'Time Series',
      types: ['TIMESERIES'],
      required: true,
    },
  ],
  functionData: {},
} as StorableNode;
