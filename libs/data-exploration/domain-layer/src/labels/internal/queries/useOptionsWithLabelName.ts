import { useMemo } from 'react';

import { useGetLabelName } from './useGetLabelName';

type OptionType = {
  value: string;
};

export const useOptionsWithLabelName = <T extends OptionType>(
  options: T[]
): (T & { label: string })[] => {
  const getLabelName = useGetLabelName();

  return useMemo(() => {
    return options.map((option) => {
      return {
        ...option,
        label: getLabelName(option.value),
      };
    });
  }, [getLabelName, options]);
};
