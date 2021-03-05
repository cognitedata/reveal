import { StorableNode } from 'reducers/charts';

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
} as StorableNode;
