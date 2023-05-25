import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';
import { AdvancedFilter } from '../../../builders';
import { queryKeys } from '../../../queryKeys';
import { DocumentProperties } from '../../internal';

import { getDocumentsUniqueValuesByProperty } from '../network';
import { DocumentProperty, DocumentSourceProperty } from '../types';

interface Props {
  property: DocumentProperty | DocumentSourceProperty;
  filter?: AdvancedFilter<DocumentProperties>;
  query?: string;
}

export const useDocumentsUniqueValuesByProperty = ({
  property,
  filter,
  query,
}: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.documentsUniqueValues(property, filter, query),
    () => {
      return getDocumentsUniqueValuesByProperty(sdk, property, {
        filter,
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    {
      keepPreviousData: true,
    }
  );
};
