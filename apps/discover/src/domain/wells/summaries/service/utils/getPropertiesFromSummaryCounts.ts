import { SummaryCount } from '@cognite/sdk-wells-v3';

export const getPropertiesFromSummaryCounts = (
  summaryCounts: SummaryCount[]
): string[] => {
  return summaryCounts.map(({ property }) => property);
};
