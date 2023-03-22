import React from 'react';
import { Document, DocumentTable } from '@cognite/react-document-table';
import { FileInfo } from '@cognite/sdk';
import { useResourceResults } from '@data-exploration-components/containers';
import { InternalFilesFilters } from '@data-exploration-lib/core';
import { docTypes } from './docTypes';

type FileGroupingTableProps = {
  data?: FileInfo[];
  query?: string;
  filter?: InternalFilesFilters;
  onItemClicked: (file: any) => void;
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

const FileGroupingTable = ({
  data,
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

  const docs: Document[] = convertFilesToDocs(data || files);

  return (
    <DocumentTable
      docs={docs}
      docTypes={docTypes}
      handleDocumentClick={onItemClicked}
    />
  );
};

export default FileGroupingTable;
