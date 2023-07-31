import { WellPropertiesEnum } from '@cognite/sdk-wells';

import { FilterIDs } from 'modules/wellSearch/constants';

export const WELL_PROPERTY_FILTER_ID_MAP: Record<
  typeof WELL_PROPERTY_FILTER_IDS[number],
  WellPropertiesEnum
> = {
  [FilterIDs.REGION]: 'region',
  [FilterIDs.FIELD]: 'field',
  [FilterIDs.BLOCK]: 'block',
};

export const WELL_PROPERTY_FILTER_IDS = [
  FilterIDs.REGION,
  FilterIDs.FIELD,
  FilterIDs.BLOCK,
] as const;
