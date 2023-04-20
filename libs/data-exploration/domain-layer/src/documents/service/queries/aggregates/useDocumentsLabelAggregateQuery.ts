import { useQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { queryKeys } from '../../../../queryKeys';
import { getDocumentsAggregate } from '../../network';
import { DocumentsAggregateUniqueValuesItem, Label } from '@cognite/sdk';
import { AdvancedFilter } from '@data-exploration-lib/domain-layer';
import { DocumentProperties } from '../../../internal';

interface Props {
  filter?: AdvancedFilter<DocumentProperties>;
  prefix?: string;
}

export const useDocumentsLabelAggregateQuery = ({ filter, prefix }: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.documentsLabelValues(filter, prefix),
    () => {
      return getDocumentsAggregate<DocumentsAggregateUniqueValuesItem>(sdk, {
        aggregate: 'uniqueValues',
        properties: [
          {
            property: ['labels'],
          },
        ],
        filter,
        aggregateFilter: prefix ? { prefix: { value: prefix } } : undefined,
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
