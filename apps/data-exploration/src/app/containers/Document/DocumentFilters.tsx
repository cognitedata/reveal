import React from 'react';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';

import { TempMultiSelectFix } from '@data-exploration-app/containers/elements';
import {
  useDocumentFilters,
  useResetDocumentFilters,
} from '@data-exploration-app/store/filter/selectors/documentSelectors';
import {
  useDocumentAggregateAuthorQuery,
  useDocumentAggregateSourceQuery,
  useDocumentSearchResultQuery,
  useDocumentAggregateFileTypeQuery,
} from '@data-exploration-lib/domain-layer';

import { useFilterEmptyState } from '@data-exploration-app/store';
import {
  MetadataFilterV2,
  MultiSelectFilterNew,
} from '@cognite/data-exploration';
import isEmpty from 'lodash/isEmpty';

import { SPECIFIC_INFO_CONTENT } from '@data-exploration-app/containers/constants';

export const DocumentFilter = ({ ...rest }) => {
  const [documentFilter, setDocumentFilter] = useDocumentFilters();
  const resetDocumentFilters = useResetDocumentFilters();
  const isFiltersEmpty = useFilterEmptyState('document');

  const { results } = useDocumentSearchResultQuery({ filter: documentFilter });

  const resultWithMetadata = results.map((document) => ({
    ...document,
    metadata: document.sourceFile.metadata,
  }));

  const { data: authorOptions, isError: isAuthorError } =
    useDocumentAggregateAuthorQuery();
  const { data: fileTypeItems, isError: isFileTypeError } =
    useDocumentAggregateFileTypeQuery();
  const { data: sourceItems, isError: isSourceError } =
    useDocumentAggregateSourceQuery();

  return (
    <BaseFilterCollapse.Panel
      title="Files"
      infoContent={SPECIFIC_INFO_CONTENT}
      hideResetButton={isFiltersEmpty}
      onResetClick={resetDocumentFilters}
      {...rest}
    >
      <TempMultiSelectFix>
        <MultiSelectFilterNew
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
        <MultiSelectFilterNew
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
        <MultiSelectFilterNew
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
          setValue={(newMetadata) => {
            setDocumentFilter({
              metadata: isEmpty(newMetadata) ? undefined : newMetadata,
            });
          }}
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
