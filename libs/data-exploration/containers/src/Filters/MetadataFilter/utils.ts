import { METADATA_ALL_VALUE } from '@data-exploration-lib/core';
import { OptionSelection, OptionType } from '@data-exploration/components';
import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';

export const transformMetadataKeysToOptions = (
  data?: {
    count: number;
    values: string[];
  }[]
) => {
  return (data || []).map((item) => ({
    label: head(item.values),
    value: head(item.values),
    count: item.count,
  })) as OptionType[];
};

// { 'keyA': ['ab', 'c'] } --> [ {key: 'keyA', value: 'ab' }]
export const transformMetadataSelectionChange = (
  selection: OptionSelection
) => {
  return Object.keys(selection).reduce((acc, key) => {
    const values = selection[key] as string[];

    if (isEmpty(values)) {
      return [...acc, { key, value: METADATA_ALL_VALUE }];
    }

    const pairs = values.map((item) => ({ key, value: item }));

    return [...acc, ...pairs];
  }, [] as { key: string; value: string }[]);
};

export const transformMetadataValues = (
  values?: { key: string; value: string }[]
) => {
  return values?.reduce((acc, { key, value }) => {
    if (value === METADATA_ALL_VALUE) {
      return { ...acc, [key]: [] };
    }
    return { ...acc, [key]: acc[key] ? [...acc[key], value] : [value] };
  }, {} as OptionSelection);
};
