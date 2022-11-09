import { formatDate } from '@cognite/cogs.js';
import { DateRange, Metadata } from '@cognite/sdk';
import startCase from 'lodash/startCase';
import isObject from 'lodash/isObject';
import { CUSTOM_FILTER_TITLE } from './constants';

export const getTitle = (input: string) => {
  return CUSTOM_FILTER_TITLE[input] || startCase(input);
};

// Not really sure where to put this type, leaving it here for now.
type FilterValues =
  | {
      label?: string | undefined;
      value: number;
    }
  | string
  | Metadata
  | DateRange
  | Number
  | Boolean
  | undefined;

export const formatValue = (input?: FilterValues): string => {
  if (input === undefined) {
    return '';
  }

  if (typeof input === 'boolean') {
    return input ? 'True' : 'False';
  }

  if (typeof input === 'string') {
    return input;
  }

  if (typeof input === 'number') {
    return String(input);
  }

  if ('min' in input || 'max' in input) {
    if (input.min && input.max) {
      return `${formatDate(input.min as number)} - ${formatDate(
        input.max as number
      )}`;
    }

    if (input.min) {
      return `After ${formatDate(input.min as number)}`;
    }

    if (input.max) {
      return `Before ${formatDate(input.max as number)}`;
    }
  }

  if ('key' in input && 'value' in input) {
    return `${input.key}=${input.value}`;
  }

  if ('label' in input || 'value' in input) {
    return input.label || String(input.value);
  }

  if (isObject(input)) {
    return Object.entries(input)
      .map(([key, value]) => {
        return `${key}=${value}`;
      })
      .join(', ');
  }

  return JSON.stringify(input);
};
