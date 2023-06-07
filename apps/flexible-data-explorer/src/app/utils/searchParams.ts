import { URLSearchParamsInit, createSearchParams } from 'react-router-dom';

import { SearchParams } from '../types';

export const encodeSearchParams = (params: URLSearchParamsInit) => {
  return createSearchParams(params);
};

export const decodeSearchParams = (searchParams: URLSearchParams) => {
  return [...searchParams.entries()].reduce((acc, [key, value]) => {
    try {
      return {
        ...acc,
        [key]: JSON.parse(value),
      };
    } catch {
      return {
        ...acc,
        [key]: value,
      };
    }
  }, {} as SearchParams);
};
