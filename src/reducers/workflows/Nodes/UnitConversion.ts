import { StorableNode } from '../types';

type DataPoint = {
  value: number;
};

export const NodeEffect = async (funcData: any, a: DataPoint[]) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return {
    result: a.map((x) => ({
      ...x,
      value: x.value * funcData.conversionMultiplier,
    })),
  };
};

export const NodeEffectId = 'UNIT_CONVERSION';

export default {
  title: 'A to B',
  subtitle: 'CONVERSION',
  color: '#FC2574',
  icon: 'Function',
  outputPins: [
    {
      id: 'result',
      title: 'Result',
      type: 'TIMESERIES',
    },
  ],
  functionEffectReference: NodeEffectId,
  inputPins: [
    {
      id: 'input-A',
      title: 'Time Series',
      types: ['TIMESERIES'],
      required: true,
    },
  ],
  functionData: {
    conversionMultiplier: 2,
  },
} as StorableNode;
