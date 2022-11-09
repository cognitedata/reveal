import { WellPropertiesSummaryRow } from '@cognite/sdk-wells';

export const getMockWellPropertiesSummaryRow = (
  extras?: Partial<WellPropertiesSummaryRow>
): WellPropertiesSummaryRow => {
  return {
    region: 'Discover',
    wellsCount: 1,
    ...extras,
  };
};
