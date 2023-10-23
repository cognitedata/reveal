import React from 'react';

import { EmptyState } from '@data-exploration/components';
import isEmpty from 'lodash/isEmpty';

import { Document, DocumentTable } from '@cognite/react-document-table';
import { FileInfo } from '@cognite/sdk';

import { InternalFilesFilters } from '@data-exploration-lib/core';

import { docTypes, useResourceResults } from '../../index';

type FileGroupingTableProps = {
  query?: string;
  filter?: InternalFilesFilters;
  currentView: string;
  isLoading?: boolean;
  setCurrentView: (view: string) => void;
  onItemClicked?: (file: any) => void;
};

const convertFilesToDocs = (files: FileInfo[] = []): Document[] => {
  return files?.map((file) => {
    const { id, name: fileName, metadata, directory, source, uploaded } = file;
    return {
      id,
      fileName,
      metadata,
      directory,
      source,
      uploaded,
    };
  });
};

export const FileGroupingTable = ({
  query,
  filter,
  isLoading,
  onItemClicked,
}: FileGroupingTableProps) => {
  const { items: files } = useResourceResults<FileInfo>(
    'files',
    query,
    filter,
    1000
  );

  const docs: Document[] = convertFilesToDocs(files);

  if (isEmpty(docs)) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <DocumentTable
      docs={docs}
      docTypes={docTypes}
      handleDocumentClick={onItemClicked}
    />
  );
};
