import React, { useContext, useState, useEffect, useMemo } from 'react';

import {
  UploadButton,
  VerticalDivider,
  TableProps,
} from '@data-exploration/components';

import { Asset, FileInfo } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

import {
  AppContext,
  CLOSE_DROPDOWN_EVENT,
  DATA_EXPLORATION_COMPONENT,
  InternalDocumentFilter,
  mergeInternalFilters,
  useGetSearchConfigFromLocalStorage,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  InternalDocument,
  TableSortBy,
  getChatCompletions,
  useDocumentSearchResultWithMatchingLabelsQuery,
  useDocumentFilteredAggregateCount,
} from '@data-exploration-lib/domain-layer';

import { AppliedFiltersTags } from '../AppliedFiltersTags';
import { SearchResultCountLabel } from '../SearchResultCountLabel';
import { SearchResultToolbar } from '../SearchResultToolbar';

import { DocumentsTable } from './DocumentsTable';
import { DocumentUploaderModal } from './DocumentUploader';

export interface DocumentSearchResultsProps
  extends Omit<TableProps<InternalDocument>, 'id' | 'data' | 'columns'> {
  id?: string;
  query?: string;
  filter: InternalDocumentFilter;
  defaultFilter?: InternalDocumentFilter;
  onClick: (item: InternalDocument) => void;
  onRootAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
  onFileClicked?: (file: FileInfo) => boolean;
  selectedRow?: Record<string | number, boolean>;
  isDocumentsGPTEnabled?: boolean;
  hideUploadButton?: boolean;
}

export const DocumentSearchResults = ({
  isDocumentsGPTEnabled,
  query = '',
  filter = {},
  defaultFilter = {},
  onClick,
  onRootAssetClick,
  id,
  selectedRow,
  onFilterChange,
  onFileClicked,
  hideUploadButton = false,
  ...rest
}: DocumentSearchResultsProps &
  Omit<TableProps<InternalDocument>, 'data' | 'columns' | 'id'>) => {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const [realQuery, setRealQuery] = useState<string>();
  const [gptColumnName, setGptColumnName] = useState<string>(
    t('SUMMARY', 'Summary')
  );
  const context = useContext(AppContext);

  const trackUsage = context?.trackUsage;

  const documentSearchConfig = useGetSearchConfigFromLocalStorage('file');

  const mergedFilter = useMemo(() => {
    return mergeInternalFilters(filter, defaultFilter);
  }, [defaultFilter, filter]);

  const { results, isLoading, fetchNextPage, hasNextPage } =
    useDocumentSearchResultWithMatchingLabelsQuery(
      {
        filter: mergedFilter,
        query: isDocumentsGPTEnabled ? realQuery : query,
        sortBy,
      },
      { keepPreviousData: true },
      documentSearchConfig
    );

  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const { data: aggregateCount = 0 } = useDocumentFilteredAggregateCount(
    {
      query,
      filters: mergedFilter,
    },
    documentSearchConfig
  );
  const sdk = useSDK();

  useEffect(() => {
    async function retrieveAnswer() {
      if (!query || !query.endsWith('?')) {
        setRealQuery(query);
        setGptColumnName(t('SUMMARY', 'Summary'));
        return;
      }

      const gptContent = `
      Can you split the following user question into 3 parts and give the answer as JSON key-value pairs:
      1. A keyword search prompt to find the relevant documents. 
      2. A GPT prompt that will look for the answer within each document.
      3. A column name with max 3 words describing the results from the GPT prompt.
      
      Return only the answer as a json key-value pair using the keys: keywords, prompt, column_name.

      "${query}"
      `; // Can use this: Ensure the keywords are split by |.

      const choices = await getChatCompletions(
        {
          messages: [
            {
              role: 'system',
              content: 'You are an industrial co-pilot, used by engineers.',
            },
            {
              role: 'user',
              content: gptContent,
            },
          ],
          temperature: 0,
          maxTokens: 500,
        },
        sdk
      );

      const summary = JSON.parse(choices[0].message.content.trim());
      setGptColumnName(summary['column_name']);
      setRealQuery(summary['keywords']);

      if (trackUsage) {
        trackUsage(
          DATA_EXPLORATION_COMPONENT.SEARCH.DOCUMENT_GPT_SEARCH_PROMPT,
          {
            query: query,
            numberOfDocuments: results.length,
            result: { summary },
          }
        );
      }
    }

    if (isDocumentsGPTEnabled) {
      retrieveAnswer();
    }
  }, [query, sdk]);

  const { data: hasEditPermissions } = usePermissions(
    'filesAcl',
    'WRITE',
    undefined,
    { enabled: !!context?.flow }
  );

  return (
    <>
      <DocumentsTable
        id={id || 'documents-search-results'}
        enableSorting
        selectedRows={selectedRow}
        onSort={setSortBy}
        query={query}
        gptColumnName={gptColumnName}
        isDocumentsGPTEnabled={isDocumentsGPTEnabled}
        tableHeaders={
          <>
            <SearchResultToolbar
              style={{ width: '100%' }}
              showCount={true}
              resultCount={
                <SearchResultCountLabel
                  loadedCount={results.length}
                  totalCount={aggregateCount}
                  resourceType="file"
                />
              }
            />
            {!hideUploadButton && (
              <>
                <UploadButton
                  onClick={() => {
                    setModalVisible(true);
                    trackUsage &&
                      trackUsage(DATA_EXPLORATION_COMPONENT.CLICK.UPLOAD, {
                        table: 'file',
                        isAdvanceFiltersEnabled: true,
                      });
                  }}
                  disabled={!hasEditPermissions}
                />
                <VerticalDivider />
              </>
            )}
          </>
        }
        sorting={sortBy}
        tableSubHeaders={
          <AppliedFiltersTags
            filter={filter}
            onFilterChange={onFilterChange}
            icon="Document"
          />
        }
        data={results}
        onRowClick={(document) => {
          if (document !== undefined) {
            onClick(document);
          }
        }}
        onRootAssetClick={onRootAssetClick}
        showLoadButton
        fetchMore={() => {
          fetchNextPage();
        }}
        hasNextPage={hasNextPage}
        isLoadingMore={isLoading}
        {...rest}
      />
      {modalVisible && (
        <DocumentUploaderModal
          key="document-uploader-modal"
          visible={modalVisible}
          onFileSelected={(file) => {
            if (onFileClicked) {
              if (!onFileClicked(file)) {
                return;
              }
            }
            setModalVisible(false);
            window.dispatchEvent(new Event(CLOSE_DROPDOWN_EVENT));
          }}
          onCancel={() => setModalVisible(false)}
        />
      )}
    </>
  );
};
