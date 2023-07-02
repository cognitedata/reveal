import { OptionType } from '@cognite/cogs.js';

import { TFunction } from '../../../../../../hooks/useTranslation';

export const mapOptionToOptionType = <T extends string>(
  option: T,
  t: TFunction
): OptionType<T> => {
  return {
    label: t(option as any),
    value: option,
  };
};
