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
  useDocumentsMetadataKeysAggregateQuery,
  useDocumentsMetadataValuesAggregateQuery,
} from '@data-exploration-lib/domain-layer';

import { useFilterEmptyState } from '@data-exploration-app/store';
import { MetadataFilterV2, MultiSelectFilter } from '@cognite/data-exploration';
import isEmpty from 'lodash/isEmpty';

import { SPECIFIC_INFO_CONTENT } from '@data-exploration-app/containers/constants';
import { InternalDocumentFilter } from '@data-exploration-lib/core';

export const DocumentFilter = ({ ...rest }) => {
  const [documentFilter, setDocumentFilter] = useDocumentFilters();
  const resetDocumentFilters = useResetDocumentFilters();
  const isFiltersEmpty = useFilterEmptyState('document');

  const { results } = useDocumentSearchResultQuery({ filter: documentFilter });

  const resultWithMetadata = results.map((document) => ({
    ...document,
    metadata: document.sourceFile.metadata,
  }));

  const { data: metadataKeys = [] } = useDocumentsMetadataKeysAggregateQuery();

  const { data: authorOptions, isError: isAuthorError } =
    useDocumentAggregateAuthorQuery();
  const { data: fileTypeItems, isError: isFileTypeError } =
    useDocumentAggregateFileTypeQuery();
  const { data: sourceItems, isError: isSourceError } =
    useDocumentAggregateSourceQuery();

  const updateDocumentFilter = <ValueType,>(
    key: keyof InternalDocumentFilter,
    newValue?: ValueType[]
  ) => {
    setDocumentFilter({
      [key]: isEmpty(newValue) ? undefined : newValue,
    });
  };

  return (
    <BaseFilterCollapse.Panel
      title="Files"
      infoContent={SPECIFIC_INFO_CONTENT}
      hideResetButton={isFiltersEmpty}
      onResetClick={resetDocumentFilters}
      {...rest}
    >
      <TempMultiSelectFix>
        <MultiSelectFilter
          title="File type"
          options={fileTypeItems}
          isDisabled={isFileTypeError}
          onChange={(newValue) => {
            updateDocumentFilter('type', newValue);
          }}
          value={documentFilter.type}
        />
        <MultiSelectFilter
          title="Author"
          options={authorOptions}
          isDisabled={isAuthorError}
          onChange={(newValue) => {
            updateDocumentFilter('author', newValue);
          }}
          value={documentFilter.author}
        />
        <MultiSelectFilter
          title="Source"
          options={sourceItems}
          isDisabled={isSourceError}
          onChange={(newValue) => {
            updateDocumentFilter('source', newValue);
          }}
          value={documentFilter.source}
        />
        <MetadataFilterV2
          items={resultWithMetadata}
          keys={metadataKeys}
          value={documentFilter.metadata}
          setValue={(newValue) => {
            updateDocumentFilter('metadata', newValue);
          }}
          useAggregateMetadataValues={useDocumentsMetadataValuesAggregateQuery}
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
