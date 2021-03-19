import { StorableNode } from 'reducers/charts/types';

export const effectId = 'OUTPUT';

export const node = {
  title: 'Output',
  subtitle: 'TIMESERIES',
  color: '#4A67FB',
  icon: 'Icon',
  outputPins: [],
  inputPins: [
    {
      id: 'datapoints',
      title: 'Time Series',
      types: ['TIMESERIES'],
    },
  ],
  functionEffectReference: effectId,
} as StorableNode;
