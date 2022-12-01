import config from 'utils/config';
import { Facility } from 'types';

export const facilityList = (project: string): Facility[] =>
  [
    {
      id: '2',
      path: 'borger',
      name: 'Borger',
      shortName: 'Borger',
      datasetId: 4809044228760729,
      env: ['development', 'staging', 'production'],
      project: 'accenture-p66-aimi-dev',
    },
    {
      id: '86104',
      path: 'sweeny',
      name: 'Sweeny',
      shortName: 'Sweeny',
      datasetId: 2688254680312305,
      env: ['development', 'staging', 'production'],
      project: 'accenture-p66-aimi-dev',
    },
    {
      id: '11282',
      path: 'sweeny',
      name: 'Sweeny',
      shortName: 'Sweeny',
      datasetId: 2560456674711232,
      env: ['development', 'staging', 'production'],
      project: 'accenture-p66-aimi',
    },
  ].filter((item) => item.env.includes(config.env) && item.project === project);

export const defaultFacility = (project: string) => facilityList(project)[0];
