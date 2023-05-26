import {
  formatBigNumbersWithSuffixStringExtended,
  withThousandSeparator,
} from '@data-exploration-lib/core';

import { ChipProps } from '@cognite/cogs.js';

export const getChipRightPropsForResourceCounter = (
  count: number,
  isLoading: boolean
): {
  chipRight?: ChipProps;
} => {
  const shortendCount = `${formatBigNumbersWithSuffixStringExtended(count)}`;
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
