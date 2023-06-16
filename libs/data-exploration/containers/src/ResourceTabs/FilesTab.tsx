import { useGetSearchConfigFromLocalStorage } from '@data-exploration-lib/core';
import { useDocumentFilteredAggregateCount } from '@data-exploration-lib/domain-layer';

import { useResultCount } from '../Temp';

import { CounterTab } from './elements';
import { getChipRightPropsForResourceCounter } from './getChipRightPropsForResourceCounter';
import { ResourceTabProps } from './types';

export const FilesTab = ({
  query,
  filter,
  isDocumentsApiEnabled = true,
  ...rest
}: ResourceTabProps) => {
  // Legacy support for old filter style it will be deleted again

  const result = useResultCount({
    filter,
    query,
    api: query && query.length > 0 ? 'search' : 'list',
    type: 'file',
  });

  const documentSearchConfig = useGetSearchConfigFromLocalStorage('file');
  const { data: filteredDocumentCount = 0, isLoading } =
    useDocumentFilteredAggregateCount(
      { filters: filter, query },
      documentSearchConfig,
      {
        enabled: isDocumentsApiEnabled,
      }
    );

  const chipRightProps = getChipRightPropsForResourceCounter(
    isDocumentsApiEnabled ? filteredDocumentCount : Number(result.count),
    isDocumentsApiEnabled ? isLoading : result?.isFetching
  );

  return <CounterTab label="Files" {...chipRightProps} {...rest} />;
};
