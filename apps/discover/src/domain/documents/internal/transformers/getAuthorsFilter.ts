import { DocumentsAggregateAllUniqueValuesItem } from '@cognite/sdk';

type AuthorData = DocumentsAggregateAllUniqueValuesItem[];

export const getAuthorsFilter = (authorsData: AuthorData) => {
  return (authorsData || [])
    .filter((item) => item.values.length > 0)
    .map((item) => {
      return {
        label: `${item.values[0]}`,
        value: item.values[0] as string,
        documentCount: item.count,
      };
    });
};
