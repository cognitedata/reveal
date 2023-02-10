import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import { MatchingLabels } from '@data-exploration-lib/domain-layer';

export const extractMatchingLabels = (
  data: Record<string, any>,
  query: string,
  properties: (
    | string
    | {
        key: string;
        label?: string;
      }
  )[],
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
      typeof property === 'string' ? data[property] : data[property.key];
    if (value) {
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
          } else if (isPartialMatch(value, query)) {
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

              if (isExactMatch(childValue, query)) {
                matchers.exact.push(`${getKey(property)} ${childKey}`);
              } else if (isPartialMatch(childValue, query)) {
                matchers.partial.push(`${getKey(property)} ${childKey}`);
              }
            });
          } else {
            value.forEach((childValue) => {
              if (typeof childValue !== 'string') {
                console.warn('Unsupported nested value type');
                return;
              }
              if (isExactMatch(childValue, query)) {
                matchers.exact.push(`${getKey(property)} ${childValue}`);
              } else if (isPartialMatch(childValue, query)) {
                matchers.partial.push(`${getKey(property)} ${childValue}`);
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

  if (isEmpty(matchers.exact) && isEmpty(matchers.partial)) {
    matchers.fuzzy.push(fallbackFuzzyMatch || 'Name or Description');
  }

  return matchers;
};

const isExactMatch = (value: string | number, query: string): boolean => {
  if (typeof value === 'number' && Number(query)) {
    return value === Number(query);
  }

  return value.toString().toLowerCase() === query.toLowerCase();
};

const isPartialMatch = (value: string, query: string): boolean => {
  return (value as string).toLowerCase().startsWith(query.toLowerCase());
};
