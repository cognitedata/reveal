import type { OptionType } from '@cognite/cogs.js';

import type { OptionGroupValues } from './types';

export function generateOptions(
  filterName: string,
  label: string,
  options: Record<string, string> | undefined
): OptionType<OptionGroupValues>[] {
  if (!options) {
    return [];
  }

  const parsedOptions = Object.keys(options).map((option) => ({
    label: options[option],
    value: { key: filterName, value: option },
  }));
  return [
    {
      label,
      options: parsedOptions,
    },
  ];
}
