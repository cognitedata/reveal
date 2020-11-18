import { StorableNode } from '../types';

export const effect = async (functionData: any) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    output: functionData.dummyData,
  };
};

export const effectId = 'DUMMY_TIME_SERIES';

export const node = {
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
  functionEffectReference: effectId,
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
