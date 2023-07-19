import React from 'react';

import { Document, DocumentTable } from '@cognite/react-document-table';
import { FileInfo } from '@cognite/sdk';

import { InternalFilesFilters } from '@data-exploration-lib/core';

import { docTypes, useResourceResults } from '../../index';

type FileGroupingTableProps = {
  query?: string;
  filter?: InternalFilesFilters;
  currentView: string;
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
  onItemClicked,
}: FileGroupingTableProps) => {
  const { items: files } = useResourceResults<FileInfo>(
    'files',
    query,
    filter,
    1000
  );
  const docs: Document[] = convertFilesToDocs(files);

  return (
    <DocumentTable
      docs={docs}
      docTypes={docTypes}
      handleDocumentClick={onItemClicked}
    />
  );
};
