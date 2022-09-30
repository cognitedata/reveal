import config from 'utils/config';
import { Facility } from 'types';

export const facilityList: Facility[] = [
  {
    id: '2',
    path: 'borger',
    name: 'Borger',
    shortName: 'Borger',
    unitPattern: /^G(\d+(\.\d+)?)(.*)$/,
    env: ['development', 'staging', 'production'],
  },
  {
    id: '11282',
    path: 'sweeny',
    name: 'Sweeny',
    shortName: 'Sweeny',
    env: ['development', 'staging', 'production'],
  },
].filter((item) => item.env.includes(config.env));

export const defaultFacility = facilityList[0];
