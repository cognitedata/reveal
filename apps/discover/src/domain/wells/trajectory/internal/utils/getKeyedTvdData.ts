import head from 'lodash/head';

import { GroupedTvdData, KeyedTvdData } from '../types';

export const getKeyedTvdData = (data: GroupedTvdData): KeyedTvdData => {
  return Object.keys(data).reduce((tvdData, wellboreMatchingId) => {
    return {
      ...tvdData,
      [wellboreMatchingId]: head(data[wellboreMatchingId]),
    };
  }, {});
};
