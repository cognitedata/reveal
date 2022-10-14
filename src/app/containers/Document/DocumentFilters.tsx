import React from 'react';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';

import { TempMultiSelectFix } from 'app/containers/elements';
import {
  useDocumentFilters,
  useResetDocumentFilters,
} from 'app/store/filter/selectors/documentSelectors';
import { useDocumentAggregateAuthorQuery } from 'app/domain/document/service/queries/aggregates/useDocumentAggregateAuthorQuery';
import { useDocumentAggregateMimeTypeQuery } from 'app/domain/document/service/queries/aggregates/useDocumentAggregateMimeTypeQuery';
import { useDocumentAggregateSourceQuery } from 'app/domain/document/service/queries/aggregates/useDocumentAggregateSourceQuery';
import { MultiSelectFilter } from 'app/components/Filters/MultiSelectFilter';
import { useFilterEmptyState } from 'app/store';

export const DocumentFilter = ({ ...rest }) => {
  const [documentFilter, setDocumentFilter] = useDocumentFilters();
  const resetDocumentFilters = useResetDocumentFilters();
  const isFiltersEmpty = useFilterEmptyState('document');

  const { data: authorOptions, isError: isAuthorError } =
    useDocumentAggregateAuthorQuery();
  const { data: mimeTypeItems, isError: isMimeTypeError } =
    useDocumentAggregateMimeTypeQuery();
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
          options={mimeTypeItems}
          isDisabled={isAuthorError}
          onChange={(newValue: string[]) => {
            setDocumentFilter({
              mimeType: newValue && newValue.length > 0 ? newValue : undefined,
            });
          }}
          values={documentFilter.mimeType}
        />
        <MultiSelectFilter
          title="Author"
          options={authorOptions}
          isDisabled={isMimeTypeError}
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
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
