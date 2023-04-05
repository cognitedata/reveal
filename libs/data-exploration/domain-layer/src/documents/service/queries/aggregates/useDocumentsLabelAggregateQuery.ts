import { useQuery, UseQueryOptions } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { queryKeys } from '../../../../queryKeys';
import { getDocumentsAggregate } from '../../network';
import { DocumentsAggregateUniqueValuesItem, Label } from '@cognite/sdk';

type ExtendedDocumentsAggregateUniqueValuesItem =
  DocumentsAggregateUniqueValuesItem & {
    value: string;
  };

export const useDocumentsLabelAggregateQuery = <
  T = ExtendedDocumentsAggregateUniqueValuesItem
>(
  options?: Omit<
    UseQueryOptions<ExtendedDocumentsAggregateUniqueValuesItem[], any, T[]>,
    'queryKey'
  >
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.documentsLabelValues(),
    () => {
      return getDocumentsAggregate<DocumentsAggregateUniqueValuesItem>(sdk, {
        aggregate: 'uniqueValues',
        properties: [
          {
            property: ['labels'],
          },
        ],
      }).then(({ items }) => {
        return items.map(({ count, values }) => {
          return {
            count,
            value: (values[0] as Label).externalId,
            values,
          };
        });
      });
    },
    options
  );
};
