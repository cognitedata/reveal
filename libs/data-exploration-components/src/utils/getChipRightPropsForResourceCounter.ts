import { ChipProps } from '@cognite/cogs.js';

export const getChipRightPropsForResourceCounter = (
  count: string,
  showCount: boolean,
  isLoading: boolean
): {
  chipRight?: ChipProps;
} => {
  if (!showCount) return {};
  return {
    chipRight: isLoading
      ? { icon: 'Loader', size: 'x-small' }
      : {
          label: count,
          size: 'x-small',
        },
  };
};
