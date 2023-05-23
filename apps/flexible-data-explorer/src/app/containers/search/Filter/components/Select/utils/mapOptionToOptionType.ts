import { OptionType } from '@cognite/cogs.js';

export const mapOptionToOptionType = <T extends string>(
  option: T
): OptionType<T> => {
  return {
    label: option,
    value: option,
  };
};
