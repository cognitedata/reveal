import { base64Decode, flattenNestedObjArray } from '.';
import {
  CdfApiConfig,
  CdfApiEndpointConfig,
  FilterMode,
  MockData,
} from '../types';
import { flattenObjAsArray, isObject } from './data-utils';

/**
 * Converts URL pattern used in config
 * to RegExp.
 * Url patterns could be:
 * * strings - /api/project/assets/list
 * * contain asterisk(*) - /api/project/assets\/*\/someting
 */
export const urlPatternToRegExp = (urlPattern: string): RegExp =>
  new RegExp(urlPattern.replace('*', '.*'));

export const getConfigForUrl = (
  config: CdfApiConfig,
  url: string
): CdfApiEndpointConfig => {
  const matches = Object.keys(config.endpoints).filter((pattern) => {
    return urlPatternToRegExp(pattern).test(url);
  });

  const endpointConfig =
    matches && matches.length ? config.endpoints[matches[0]] : {};

  return endpointConfig;
};

export const mapParamsAsFilter = (reqParams) => {
  return { filter: { ...reqParams } };
};

export type RequestBody = {
  filter?: Record<string, unknown>;
  search?: Record<string, unknown>;
  cursor?: string;
  limit?: number;
  sort?: {
    [key: string]: string;
  };
};

export const mapRequestBodyToQueryParams = (
  reqBody: RequestBody,
  filterMode: FilterMode,
  config: CdfApiEndpointConfig
) => {
  const filters = {};

  const requestBodyFilter = reqBody.filter;
  const filtersConfig = config.filters || {};

  for (const key in requestBodyFilter) {
    const filterConfig =
      filtersConfig && filtersConfig[key] ? filtersConfig[key] : {};

    // when mocking there are cases that we can't cover
    // skip if this flag is set
    if (filterConfig.ignore) {
      continue;
    }

    // In case if we have provided the filter name in config, use that one
    // There are cases where filter name does not corespond to our data
    const filterName = filterConfig.rewrite ? filterConfig.rewrite : key;

    if (Array.isArray(requestBodyFilter[key])) {
      const filterObjVals = requestBodyFilter[key] as any[];

      if (!filterObjVals.length) {
        continue;
      }

      const first = filterObjVals[0];

      if (first) {
        if (isObject(first)) {
          filters[filterName] = flattenObjAsArray(filterObjVals);
        } else {
          filters[filterName] = filterObjVals.map((item) => item.toString());
        }
      }
    } else if (isObject(requestBodyFilter[key])) {
      const filterObj = requestBodyFilter[key] as MockData;

      // In case if this is object, usually it should be range min/max
      if (
        // eslint-disable-next-line no-prototype-builtins
        filterObj.hasOwnProperty('min') ||
        // eslint-disable-next-line no-prototype-builtins
        filterObj.hasOwnProperty('max')
      ) {
        if (filterObj.min) {
          filters[`${filterName}_gte`] = +filterObj.min;
        }
        if (filterObj.max) {
          filters[`${filterName}_lte`] = +filterObj.max;
        }
      } else {
        // otherwise could be searching for nested property like metadata
        for (const objKey in filterObj) {
          filters[`${filterName}.${objKey}`] = filterObj[objKey];
        }
      }
    } else {
      filters[filterName] = requestBodyFilter[key];
    }
  }

  if (filterMode === 'search') {
    for (const searchKey in reqBody.search) {
      if (searchKey === 'query') {
        filters['q'] = reqBody.search[searchKey];
      } else {
        filters[`${searchKey}_like`] = reqBody.search[searchKey];
      }
    }
  }

  if (reqBody.limit) {
    filters['_limit'] = +reqBody.limit;
  }

  if (reqBody.cursor) {
    try {
      const cursorBody = base64Decode(reqBody.cursor).split('_');
      filters['_start'] = +cursorBody[0];
      delete reqBody.cursor;
    } catch (err) {
      console.error(`Can not parse cursor, should be base64 string`, err);
    }
  }

  if (reqBody.sort) {
    filters['_sort'] = Object.keys(reqBody.sort).join(',');
    filters['_order'] = Object.keys(reqBody.sort)
      .map((sortKey) => reqBody.sort[sortKey])
      .join(',');
  }

  return filters;
};
