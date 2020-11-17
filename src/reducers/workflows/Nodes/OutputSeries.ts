import { StorableNode } from '../types';

export default {
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
