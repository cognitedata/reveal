import { StorableNode } from '../types';

export const node = {
  title: 'New Time Series',
  subtitle: 'TIMESERIES',
  color: '#4A67FB',
  icon: 'Icon',
  outputPins: [],
  inputPins: [
    {
      id: 'datapoints',
      title: 'Data points',
      types: ['TIMESERIES'],
    },
  ],
} as StorableNode;
