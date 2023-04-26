import { useQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { queryKeys } from '../../../../queryKeys';
import { getDocumentsAggregate } from '../../network';
import { DocumentsAggregateUniqueValuesItem, Label } from '@cognite/sdk';
import { AdvancedFilter } from '@data-exploration-lib/domain-layer';
import { DocumentProperties } from '../../../internal';

interface Props {
  filter?: AdvancedFilter<DocumentProperties>;
  query?: string;
}

export const useDocumentsLabelAggregateQuery = ({ filter, query }: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.documentsLabelValues(filter, query),
    () => {
      return getDocumentsAggregate<DocumentsAggregateUniqueValuesItem>(sdk, {
        aggregate: 'uniqueValues',
        properties: [
          {
            property: ['labels'],
          },
        ],
        filter,
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
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
    {
      keepPreviousData: true,
    }
  );
};
