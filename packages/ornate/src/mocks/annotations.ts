import { OrnateAnnotation } from '../types';

export const mockAnnotations: OrnateAnnotation[] = [
  {
    id: '1',
    type: 'pct',
    width: 0.1,
    height: 0.1,
    x: 0.1,
    y: 0.1,
    // eslint-disable-next-line no-console
    onClick: () => console.log('haa'),
    stroke: 'orange',
    metadata: {
      type: 'document',
    },
  },
  {
    id: '2',
    type: 'pct',
    width: 0.2,
    height: 0.2,
    x: 0.5,
    y: 0.5,
    // eslint-disable-next-line no-console
    onClick: () => console.log('hoo'),
    stroke: 'blue',
    metadata: {
      type: 'asset',
    },
  },
];
