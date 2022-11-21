import React from 'react';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';

import { TempMultiSelectFix } from 'app/containers/elements';
import {
  useDocumentFilters,
  useResetDocumentFilters,
} from 'app/store/filter/selectors/documentSelectors';
import { useDocumentAggregateAuthorQuery } from 'app/domain/document/service/queries/aggregates/useDocumentAggregateAuthorQuery';
import { useDocumentAggregateFileTypeQuery } from 'app/domain/document/service/queries/aggregates/useDocumentAggregateFileTypeQuery';
import { useDocumentAggregateSourceQuery } from 'app/domain/document/service/queries/aggregates/useDocumentAggregateSourceQuery';
import { MultiSelectFilter } from 'app/components/Filters/MultiSelectFilter';
import { useFilterEmptyState } from 'app/store';
import { MetadataFilterV2 } from '@cognite/data-exploration';
import isEmpty from 'lodash/isEmpty';
import { useDocumentSearch } from '@cognite/react-document-search';

export const DocumentFilter = ({ ...rest }) => {
  const [documentFilter, setDocumentFilter] = useDocumentFilters();
  const resetDocumentFilters = useResetDocumentFilters();
  const isFiltersEmpty = useFilterEmptyState('document');

  const { results } = useDocumentSearch();

  const resultWithMetadata = results.map(document => ({
    ...document.item,
    metadata: document.item.sourceFile.metadata,
  }));

  const { data: authorOptions, isError: isAuthorError } =
    useDocumentAggregateAuthorQuery();
  const { data: fileTypeItems, isError: isFileTypeError } =
    useDocumentAggregateFileTypeQuery();
  const { data: sourceItems, isError: isSourceError } =
    useDocumentAggregateSourceQuery();

  return (
    <BaseFilterCollapse.Panel
      title="Documents"
      hideResetButton={isFiltersEmpty}
      onResetClick={resetDocumentFilters}
      {...rest}
    >
      <TempMultiSelectFix>
        <MultiSelectFilter
          title="File type"
          options={fileTypeItems}
          isDisabled={isFileTypeError}
          onChange={(newValue: string[]) => {
            setDocumentFilter({
              type: newValue && newValue.length > 0 ? newValue : undefined,
            });
          }}
          values={documentFilter.type}
        />
        <MultiSelectFilter
          title="Author"
          options={authorOptions}
          isDisabled={isAuthorError}
          onChange={(newValue: string[]) => {
            setDocumentFilter({
              author: newValue && newValue.length > 0 ? newValue : undefined,
            });
          }}
          values={documentFilter.author}
        />
        <MultiSelectFilter
          title="Source"
          options={sourceItems}
          isDisabled={isSourceError}
          onChange={(newValue: string[]) => {
            setDocumentFilter({
              source: newValue && newValue.length > 0 ? newValue : undefined,
            });
          }}
          values={documentFilter.source}
        />
        <MetadataFilterV2
          items={resultWithMetadata}
          value={documentFilter.metadata}
          setValue={newMetadata => {
            setDocumentFilter({
              metadata: isEmpty(newMetadata) ? undefined : newMetadata,
            });
          }}
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
