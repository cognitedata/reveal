import { OptionType } from '@cognite/cogs.js';

import { mapOptionToOptionType } from './mapOptionToOptionType';

export const mapOptionsToOptionType = <T extends string>(
  options: T[]
): OptionType<T>[] => {
  return options.map(mapOptionToOptionType);
};
