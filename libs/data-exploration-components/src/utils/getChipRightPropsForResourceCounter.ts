import { ChipProps } from '@cognite/cogs.js';

export const getChipRightPropsForResourceCounter = (
  count: string,
  isLoading: boolean
): {
  chipRight?: ChipProps;
} => {
  return {
    chipRight: isLoading
      ? { icon: 'Loader', size: 'x-small' }
      : {
          label: count,
          size: 'x-small',
        },
  };
};
