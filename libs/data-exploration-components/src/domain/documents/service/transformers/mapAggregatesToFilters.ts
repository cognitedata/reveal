import { DocumentsAggregateAllUniqueValuesItem } from '@cognite/sdk';

export const mapAggregatesToFilters = (
  data?: DocumentsAggregateAllUniqueValuesItem[]
) => {
  return (data || []).map(item => {
    const name = item.values?.[0] || 'Unknown';
    const count = item.count;

    return {
      label: `${name} (${count})`,
      value: name,
    };
  });
};
