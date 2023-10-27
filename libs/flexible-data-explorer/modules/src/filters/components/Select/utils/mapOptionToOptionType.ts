import { TFunction } from '@fdx/shared/hooks/useTranslation';

import { OptionType } from '@cognite/cogs.js';

export const mapOptionToOptionType = <T extends string>(
  option: T,
  t: TFunction
): OptionType<T> => {
  return {
    label: t(option as any),
    value: option,
  };
};
