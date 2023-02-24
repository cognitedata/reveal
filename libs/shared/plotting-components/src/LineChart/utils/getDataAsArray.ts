import isArray from 'lodash/isArray';
import { Data } from '../types';

export const getDataAsArray = (data: Data | Data[]) => {
  if (isArray(data)) {
    return data;
  }

  return [data];
};
