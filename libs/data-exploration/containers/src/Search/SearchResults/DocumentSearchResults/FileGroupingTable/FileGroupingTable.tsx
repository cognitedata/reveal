import React from 'react';

import { EmptyState } from '@data-exploration/components';

import { Document, DocumentTable } from '@cognite/react-document-table';
import { FileInfo } from '@cognite/sdk/dist/src';

import {
  FileWithRelationshipLabels,
  InternalDocumentFilter,
  LOADING_RESULTS,
  REFINE_FILTERS_OR_UPDATE_SEARCH,
  useTranslation,
} from '@data-exploration-lib/core';
import { useDocumentSearchResultQuery } from '@data-exploration-lib/domain-layer';

import { docTypes } from './docTypes';

type FileGroupingTableProps = {
  data?: FileWithRelationshipLabels[];
  query?: string;
  filter?: InternalDocumentFilter;
  onItemClicked: (file: any) => void;
};
const convertFilesToDocs = <
  T extends Pick<FileInfo, 'id' | 'name' | 'metadata' | 'directory' | 'source'>
>(
  files: T[] = []
): Document[] => {
  return files?.map((file) => {
    const { id, name: fileName, metadata, directory, source } = file;
    return {
      id,
      fileName,
      metadata,
      directory,
      source,
    };
  });
};

export const FileGroupingTable = ({
  query,
  filter,
  data,
  onItemClicked,
}: FileGroupingTableProps) => {
  const { t } = useTranslation();

  const { results: documents, isInitialLoading } = useDocumentSearchResultQuery(
    {
      filter,
      query,
      limit: 1000,
    },
    {
      enabled: !data,
    }
  );

  const files = documents.map((document) => {
    const {
      id,
      sourceFile: { metadata, directory, source, name },
    } = document;
    return { id, metadata, directory, source, name };
  });
  const docs: Document[] = convertFilesToDocs(files || data);

  if (isInitialLoading) {
    return (
      <EmptyState isLoading title={t('LOADING_RESULTS', LOADING_RESULTS)} />
    );
  }

  if (docs.length === 0) {
    return (
      <EmptyState
        body={t(
          'REFINE_FILTERS_OR_UPDATE_SEARCH',
          REFINE_FILTERS_OR_UPDATE_SEARCH
        )}
      />
    );
  }

  return (
    <DocumentTable
      docs={docs}
      docTypes={docTypes}
      handleDocumentClick={onItemClicked}
    />
  );
};
