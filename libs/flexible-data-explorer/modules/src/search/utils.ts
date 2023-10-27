import { DataModelTypeDefsField } from '@fdx/shared/types/services';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';

export const extractProperties = (item: {
  [x: string]: unknown;
  externalId: string;
  description?: string | undefined;
}) => {
  return Object.entries(item).reduce((acc, [key, value]) => {
    if (key === 'externalId' || key === 'description' || key === 'space') {
      return acc;
    }

    if (value !== undefined && isString(value)) {
      return [...acc, { key, value }];
    }
    if (value !== undefined && isNumber(value)) {
      return [...acc, { key, value: `${value}` }];
    }

    return acc;
  }, [] as { key: string; value: string }[]);
};

export const extractItems = (data?: any) => {
  return Object.values(data || []).flatMap(({ items }: any) => items);
};

export const getNestedItemsForField = (
  field: DataModelTypeDefsField,
  item: any
) => {
  if (!item[field.name]) {
    return [];
  }
  if (field.type.list) {
    return (item[field.name] as { items: any[] }).items;
  }
  return [item[field.name]];
};

export const makeAllValuesZero = (data: Record<string, number> | undefined) => {
  return Object.keys(data ?? {}).reduce((acc, key) => {
    return { ...acc, [key]: 0 };
  }, {});
};

export function areAllValuesZero(
  values: { [key: string]: number } | undefined
) {
  return Object.values(values ?? {}).every((value) => value === 0);
}

export const makeAllValuesUnique = (array: string[]) => {
  return Array.from(new Set(array));
};
