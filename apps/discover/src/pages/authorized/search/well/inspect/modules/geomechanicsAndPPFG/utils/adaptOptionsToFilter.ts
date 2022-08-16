import isArray from 'lodash/isArray';

import { OptionType } from '@cognite/cogs.js';

export const adaptOptionsToFilter = (
  options: string[] | Record<string, string[]>
) => {
  if (isArray(options)) {
    return options.map(adaptOptionToOptionType);
  }

  return Object.keys(options).map((label) => ({
    label,
    options: options[label].map(adaptOptionToOptionType),
    value: options[label],
  }));
};

export const adaptOptionToOptionType = (
  option: string
): OptionType<string[]> => {
  return {
    label: option,
    name: option,
    value: [option],
  };
};
