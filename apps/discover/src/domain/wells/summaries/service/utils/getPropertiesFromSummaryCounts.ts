import { SummaryCount } from '@cognite/sdk-wells';

export const getPropertiesFromSummaryCounts = (
  summaryCounts: SummaryCount[]
): string[] => {
  return summaryCounts.map(({ property }) => property);
};
