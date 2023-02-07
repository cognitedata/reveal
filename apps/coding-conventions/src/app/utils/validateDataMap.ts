import { SystemTypes } from '../types';

export const validateDataMap = new Map<SystemTypes, () => string[]>();

const fetchFileNames = () => {
  // change this to fetch from the API But then we need to fill in some dummy data.
  return [
    'ZZZZZZ 15-10-10 NNN',
    'ZZZZZZ 10-10-1 NNN',
    'ZZZZZZ 10-10-10 NNN',
    'ZZZZZZ 10-10-01 NNN',
    'ZZZZZZ 10-15-02 NNN',
    'ZZZZZZ 1-10-03 NNN',
    'ZZZZZZ 2-10-04 NNN',
    'ZZZZZZ 10-AB-05 NNN',
    'ZZZZZZ AB-10-06 NNN',
    'ZZZZZZ 10-10-AV NNN',
  ];
};

validateDataMap.set('files', fetchFileNames);
