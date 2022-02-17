import { TrackConfig } from '../types';

export const DN_COLUMNS_CONFIG: TrackConfig[] = [
  {
    measurementType: 'density',
    name: 'Density',
    color: 'grey',
    dash: [4, 4],
    width: 2.2,
  },
  {
    measurementType: 'neutron porosity',
    name: 'Neutron',
    color: 'green',
    dash: [4, 4],
    width: 2.2,
  },
];
