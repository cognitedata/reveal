import { DocumentsAggregateAllUniqueValuesItem } from '@cognite/sdk';

export const mapAggregatesToFilters = (
  data?: DocumentsAggregateAllUniqueValuesItem[]
) => {
  return (data || [])
    .sort((a, b) => b.count - a.count)
    .map((item) => {
      const name = item.values?.[0] || 'Unknown';
      const count = item.count;

      return {
        label: `${name}`,
        value: name,
        count: count,
      };
    });
};
