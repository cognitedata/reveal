import { StorableNode } from '../types';

export const node = {
  title: 'Output Series',
  subtitle: 'FUNCTION',
  color: '#4A67FB',
  icon: 'Icon',
  outputPins: [],
  inputPins: [
    {
      id: 'input-timeseries',
      title: 'Time series',
      types: ['TIMESERIES'],
    },
  ],
} as StorableNode;
