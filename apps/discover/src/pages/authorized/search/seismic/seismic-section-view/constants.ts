import { Tuplet } from './types';

export const displayTypes = [
  {
    id: 'iline',
    title: 'Inline',
  },
  {
    id: 'xline',
    title: 'XLine',
  },
];

export const colors = [
  {
    id: 'greyscale',
    title: 'Grey scale',
    startColor: '#ffffff',
    middleColor: '',
    endColor: '#000000',
  },
  {
    id: 'redBlack',
    title: 'Red to black',
    startColor: '#ff0000',
    middleColor: '#FFFFFF',
    endColor: '#000000',
  },
  {
    id: 'redBlue',
    title: 'Red to blue',
    startColor: '#ff0000',
    middleColor: '#FFFFFF',
    endColor: '#0000ff',
  },
];

export const VALUE_NOT_IN_RANGE = 'Value not in the range';
export const ZOOM_FACTOR = 1;
export const DEFAULT_ZOOM_LEVEL = 1;
export const DEFAULT_COLOR_SCALE_RANGE: Tuplet = [0, 100];
