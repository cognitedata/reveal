/* eslint-disable @typescript-eslint/no-explicit-any */
import { IntrospectionQuery } from 'graphql';
import { CdfResourceObject, KeyValuePair } from '..';
import { Collection } from '../common/collection';
import { MockData } from '../types';

/**
 * Check if the given input is JS Object
 */
export const isObject = (item) => {
  return !!item && item.constructor === Object && Object.keys(item).length > 0;
};

/**
 * Encodes string to Base64 string
 */
export const base64Encode = (input: string) =>
  Buffer.from(input).toString('base64');

/**
 * Decodes Base64 string
 */
export const base64Decode = (input: string) =>
  Buffer.from(input, 'base64').toString();

/**
 * Flattens ByIds request body.
 * Input: [ { id: '1'}, {'id': '2'}]
 * Output: { 'id': ['1','2']}
 */
export const flattenNestedObjArray = (reqBody: MockData[]) => {
  const body = {};
  reqBody.forEach((item) => {
    const objKey = Object.keys(item)[0];
    // eslint-disable-next-line no-prototype-builtins
    if (!body.hasOwnProperty(objKey)) {
      body[objKey] = [];
    }
    body[objKey].push(item[objKey].toString());
  });

  return body;
};

/**
 * Flattens ByIds request body.
 * Input: [ { id: '1'}, {'id': '2'}]
 * Output: ['1','2']
 */
export const flattenObjAsArray = (reqBody: MockData[]) => {
  const response = [];
  reqBody.forEach((item) => {
    const objKey = Object.keys(item)[0];
    response.push(item[objKey].toString());
  });

  return response;
};

export function filterCollection(
  data: CdfResourceObject[],
  reqFilter: KeyValuePair,
  parsedSchema: IntrospectionQuery,
  asList = false
) {
  const dataReq = data;
  const filters = reqFilter;
  let collection = Collection.from<CdfResourceObject>(data);
  const filterKeys = Object.keys(filters);

  filterKeys
    .filter((key) => !['_and', '_or'].includes(key))
    .forEach((key) => {
      collection = collection.where((x) =>
        filterFunction(x[key], filters[key])
      );
    });

  // eslint-disable-next-line no-prototype-builtins
  if (filterKeys.includes('_or')) {
    (filters['_or'] as any).forEach((orFilter) => {
      collection = collection.concat(
        filterCollection(dataReq, orFilter, parsedSchema, true) as any
      );
    });
  }

  return asList ? collection.toCollection() : collection.toArray();
}

const filterFunction = (dbValue, filter) => {
  if (
    Object.keys(filter).some((filterKey) =>
      ['gt', 'lt', 'gte', 'lte'].includes(filterKey)
    )
  ) {
    let filterCollection = Collection.from<number>([+dbValue]);

    if (filter.lte) {
      filterCollection = filterCollection.where((x) => x <= filter.lte);
    }

    if (filter.gte) {
      filterCollection = filterCollection.where((x) => x >= filter.gte);
    }

    if (filter.lt) {
      filterCollection = filterCollection.where((x) => x < filter.lt);
    }

    if (filter.gt) {
      filterCollection = filterCollection.where((x) => x > filter.gt);
    }

    return filterCollection.count() > 0;
  }

  if (filter.anyOfTerms) {
    return filter.anyOfTerms.some((x) => dbValue.includes(x));
  }

  // get item value based on path
  // i.e post.title -> 'foo'
  const filterValue = filter.eq;

  // Prevent toString() failing on undefined or null values
  if (dbValue === undefined || dbValue === null) {
    return undefined;
  }

  if (Array.isArray(filterValue) && Array.isArray(dbValue)) {
    return dbValue.some((r) => filterValue.includes(r));
  }
  if (Array.isArray(dbValue) && !Array.isArray(filterValue)) {
    return dbValue.includes(filterValue);
  }
  if (Array.isArray(filterValue) && !Array.isArray(dbValue)) {
    return filterValue.includes(dbValue);
  }

  // eslint-disable-next-line eqeqeq
  return filterValue == dbValue.toString();
};
