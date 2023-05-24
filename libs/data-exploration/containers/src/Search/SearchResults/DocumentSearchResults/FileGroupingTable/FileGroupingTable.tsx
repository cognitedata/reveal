import React from 'react';
import { Document, DocumentTable } from '@cognite/react-document-table';
import {
  InternalDocumentFilter,
  LOADING_RESULTS,
  REFINE_FILTERS_OR_UPDATE_SEARCH,
} from '@data-exploration-lib/core';
import { docTypes } from './docTypes';
import { useDocumentSearchResultQuery } from '@data-exploration-lib/domain-layer';
import { FileInfo } from '@cognite/sdk/dist/src';
import { EmptyState } from '@data-exploration/components';

type FileGroupingTableProps = {
  data?: FileInfo[];
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
  const { results: documents, isLoading } = useDocumentSearchResultQuery(
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

  if (isLoading) {
    return <EmptyState isLoading title={LOADING_RESULTS} />;
  }

  if (docs.length === 0) {
    return <EmptyState body={REFINE_FILTERS_OR_UPDATE_SEARCH} />;
  }

  return (
    <DocumentTable
      docs={docs}
      docTypes={docTypes}
      handleDocumentClick={onItemClicked}
    />
  );
};
