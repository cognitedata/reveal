import config from 'utils/config';
import { Facility } from 'scarlet/types';

export const facilityList: Facility[] = [
  {
    sequenceNumber: '1',
    path: 'borger',
    name: 'Borger Refinery',
    shortName: 'Borger',
    unitPattern: /^G(\d+(\.\d+)?)$/,
    env: ['development', 'staging', 'production'],
  },
  {
    sequenceNumber: '2',
    path: 'bayway',
    name: 'Bayway plan',
    shortName: 'Bayway',
    unitPattern: /^G(\d+(\.\d+)?)$/,
    env: ['development'],
  },
].filter((item) => item.env.includes(config.env));

export const defaultFacility = facilityList[0];
