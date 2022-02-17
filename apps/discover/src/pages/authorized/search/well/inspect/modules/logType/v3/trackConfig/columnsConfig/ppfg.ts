import { TrackConfig } from '../types';

export const PPFG_COLUMNS_CONFIG: TrackConfig[] = [
  {
    measurementType: 'fracture pressure post drill high',
    color: 'blue',
    dash: [4, 4],
    width: 2.2,
  },
  {
    measurementType: 'fracture pressure post drill low',
    color: 'orange',
    dash: [4, 4],
    width: 2.2,
  },
  {
    measurementType: 'fracture pressure post drill mean',
    color: 'purple',
    dash: [4, 4],
    width: 2.2,
  },
  {
    measurementType: 'property',
    color: 'magenta',
    dash: [4, 4],
    width: 2.2,
  },
  {
    measurementType: 'pore pressure post drill high',
    color: 'green',
    dash: [4, 4],
    width: 2.2,
  },
  {
    measurementType: 'pore pressure post drill low',
    color: 'grey',
    dash: [4, 4],
    width: 2.2,
  },
  {
    measurementType: 'pore pressure post drill mean',
    color: 'red',
    dash: [4, 4],
    width: 2.2,
  },
  {
    measurementType: 'geomechanics',
    color: 'darkgreen',
    dash: [4, 4],
    width: 2.2,
  },
];
