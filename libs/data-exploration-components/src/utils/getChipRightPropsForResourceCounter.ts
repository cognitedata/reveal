import { ChipProps } from '@cognite/cogs.js';
import { getTabCountLabel } from './string';
import { withThousandSeparator } from '@data-exploration-lib/core';

export const getChipRightPropsForResourceCounter = (
  count: number,
  isLoading: boolean
): {
  chipRight?: ChipProps;
} => {
  const shortendCount = getTabCountLabel(count);
  return {
    chipRight: isLoading
      ? { icon: 'Loader', size: 'x-small' }
      : {
          label: shortendCount,
          size: 'x-small',
          tooltipProps: { content: withThousandSeparator(count, ',') },
        },
  };
};
