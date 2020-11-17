import { StorableNode } from '../types';

export const NodeEffect = async (functionData: any) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    output: functionData.dummyData,
  };
};

export const NodeEffectId = 'DUMMY_TIME_SERIES';

export default {
  title: 'Dummy time series',
  icon: 'LineChart',
  subtitle: 'TimeSeries',
  color: '#FF8746',
  inputPins: [],
  outputPins: [
    {
      id: 'output',
      type: 'TIMESERIES',
    },
  ],
  functionEffectReference: NodeEffectId,
  functionData: {
    dummyData: [
      {
        value: 10,
        timestamp: +Date.now(),
      },
      {
        value: 15,
        timestamp: +Date.now() + 60000,
      },
      {
        value: 20,
        timestamp: +Date.now() + 120000,
      },
    ],
  },
} as StorableNode;
