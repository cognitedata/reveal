import { OptionType } from '@cognite/cogs.js';

import { TFunction } from '../../../../../hooks/useTranslation';

import { mapOptionToOptionType } from './mapOptionToOptionType';

export const mapOptionsToOptionType = <T extends string>(
  options: T[],
  t: TFunction
): OptionType<T>[] => {
  return options.map((option) => mapOptionToOptionType(option, t));
};
