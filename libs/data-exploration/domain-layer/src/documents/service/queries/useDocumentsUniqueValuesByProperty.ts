import { useQuery } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';

import {
  AdvancedFilter,
  DocumentProperties,
  queryKeys,
} from '@data-exploration-lib/domain-layer';
import { getDocumentsUniqueValuesByProperty } from '../network';
import { DocumentProperty, DocumentSourceProperty } from '../types';

interface Props {
  property: DocumentProperty | DocumentSourceProperty;
  filter?: AdvancedFilter<DocumentProperties>;
  prefix?: string;
}

export const useDocumentsUniqueValuesByProperty = ({
  property,
  filter,
  prefix,
}: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.documentsUniqueValues(property, filter, prefix),
    () => {
      return getDocumentsUniqueValuesByProperty(sdk, property, {
        filter,
        aggregateFilter: prefix ? { prefix: { value: prefix } } : undefined,
      });
    },
    {
      keepPreviousData: true,
    }
  );
};
