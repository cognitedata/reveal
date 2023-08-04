import { ChipGroupProps, ChipProps } from '@cognite/cogs.js';

export const APPLIED_FILTER_CHIP_TYPE: ChipProps['type'] = 'neutral';

export const APPLIED_FILTERS_CHIP_GROUP_PROPS: ChipGroupProps = {
  type: APPLIED_FILTER_CHIP_TYPE,
  size: 'medium',
  overflow: 2,
};
