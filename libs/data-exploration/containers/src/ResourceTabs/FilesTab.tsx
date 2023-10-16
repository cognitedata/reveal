import {
  InternalDocumentFilter,
  InternalFilesFilters,
  mergeInternalFilters,
  useGetSearchConfigFromLocalStorage,
  useTranslation,
} from '@data-exploration-lib/core';
import { useDocumentFilteredAggregateCount } from '@data-exploration-lib/domain-layer';

import { useResultCount } from '../Temp';

import { CounterTab } from './elements';
import { getChipRightPropsForResourceCounter } from './getChipRightPropsForResourceCounter';
import { ResourceTabProps } from './types';

export const FilesTab = ({
  query,
  filter = {},
  defaultFilter = {},
  isDocumentsApiEnabled = true,
  ...rest
}: ResourceTabProps<InternalDocumentFilter | InternalFilesFilters>) => {
  const { t } = useTranslation();

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
      {
        filters: mergeInternalFilters(
          filter,
          defaultFilter
        ) as InternalDocumentFilter,
        query,
      },
      documentSearchConfig,
      {
        enabled: isDocumentsApiEnabled,
      }
    );

  const chipRightProps = getChipRightPropsForResourceCounter(
    isDocumentsApiEnabled ? filteredDocumentCount : Number(result.count),
    isDocumentsApiEnabled ? isLoading : result?.isFetching
  );

  return (
    <CounterTab label={t('FILES', 'Files')} {...chipRightProps} {...rest} />
  );
};
