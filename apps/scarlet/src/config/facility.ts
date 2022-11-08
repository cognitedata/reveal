import config from 'utils/config';
import { Facility } from 'types';

export const facilityList: Facility[] = [
  {
    id: '2',
    path: 'borger',
    name: 'Borger',
    shortName: 'Borger',
    datasetId: 4809044228760729,
    unitPattern: /^G(\d+(\.\d+)?)(.*)$/,
    env: ['development', 'staging', 'production'],
  },
  {
    id: '86104',
    path: 'sweeny',
    name: 'Sweeny',
    shortName: 'Sweeny',
    datasetId: 2688254680312305,
    env: ['development', 'staging', 'production'],
  },
].filter((item) => item.env.includes(config.env));

export const defaultFacility = facilityList[0];
