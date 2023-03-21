import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import { MatchingLabels } from '@data-exploration-lib/domain-layer';

export type MatchingLabelPropertyType =
  | string
  | {
      key: string;
      label?: string;
      useSubstringMatch?: boolean; // INFO: if you want to check for substring instead of prefix
      customMatcher?: (
        value: any,
        query: string,
        matchers: MatchingLabels
      ) => void;
    };

export const extractMatchingLabels = (
  data: Record<string, any>,
  query: string,
  properties: MatchingLabelPropertyType[],
  fallbackFuzzyMatch?: string
): MatchingLabels => {
  const matchers: MatchingLabels = {
    exact: [],
    fuzzy: [],
    partial: [],
  };

  const getKey = (property: string | { key: string; label?: string }) => {
    if (typeof property === 'string') {
      return property;
    }
    return property?.label || property.key;
  };

  properties.forEach((property) => {
    const value =
      typeof property === 'string'
        ? get(data, property)
        : get(data, property.key);

    if (value) {
      if (typeof property !== 'string' && property.customMatcher) {
        property.customMatcher(value, query, matchers);
        return;
      }

      const useSubstringMatch =
        typeof property !== 'string' && property.useSubstringMatch;

      switch (typeof value) {
        case 'number': {
          if (isExactMatch(value, query)) {
            matchers.exact.push(getKey(property));
          }
          break;
        }
        case 'string': {
          if (isExactMatch(value, query)) {
            matchers.exact.push(getKey(property));
          } else if (isPartialMatch(value, query, useSubstringMatch)) {
            matchers.partial.push(getKey(property));
          }
          break;
        }
        case 'object': {
          if (!isArray(value)) {
            Object.keys(value).forEach((childKey) => {
              const childValue = value[childKey];
              if (typeof childValue !== 'string') {
                console.warn('Unsupported nested value type');
                return;
              }
              const matchedProperty = `${getKey(property)} "${childKey}"`;
              if (isExactMatch(childValue, query)) {
                matchers.exact.push(matchedProperty);
              } else if (isPartialMatch(childValue, query, useSubstringMatch)) {
                matchers.partial.push(matchedProperty);
              }
            });
          } else {
            value.forEach((childValue) => {
              if (typeof childValue !== 'string') {
                console.warn('Unsupported nested value type');
                return;
              }
              const matchedProperty = `${getKey(property)} ${childValue}`;
              if (isExactMatch(childValue, query)) {
                matchers.exact.push(matchedProperty);
              } else if (isPartialMatch(childValue, query, useSubstringMatch)) {
                matchers.partial.push(matchedProperty);
              }
            });
          }
          break;
        }
        default: {
          console.warn('Unsupported matching label type');
        }
      }
    }
  });

  if (
    isEmpty(matchers.exact) &&
    isEmpty(matchers.partial) &&
    isEmpty(matchers.fuzzy)
  ) {
    matchers.fuzzy.push(fallbackFuzzyMatch || 'Name or Description');
  }

  return matchers;
};

export const isExactMatch = (
  value: string | number,
  query: string
): boolean => {
  if (typeof value === 'number' && Number(query)) {
    return value === Number(query);
  }

  return value.toString().toLowerCase() === query.toLowerCase();
};

export const isPartialMatch = (
  value: string,
  query: string,
  checkSubstring?: boolean
): boolean => {
  if (checkSubstring) {
    return value.toString().toLowerCase().includes(query.toLowerCase());
  }
  return value.toString().toLowerCase().startsWith(query.toLowerCase());
};
