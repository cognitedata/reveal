import { PlotConfig } from '../types';

export const DENSITY_AND_NEUTRON_PLOTS: PlotConfig[] = [
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
