import { ResourceItem } from 'types';
import React from 'react';
import { Document, DocumentTable } from '@cognite/react-document-table';
import { useList } from '@cognite/sdk-react-query-hooks';
import { FileInfo } from '@cognite/sdk';
import { docTypes } from './docTypes';

const FileGroupingTable = ({
  parentResource,
  onItemClicked,
}: {
  parentResource?: ResourceItem;
  onItemClicked: (file: any) => void;
}) => {
  const { data: fileData } = useList<FileInfo>('files', {
    limit: 1000,
    filter: {
      assetSubtreeIds: parentResource ? [{ id: parentResource.id }] : [],
    },
  });

  const modifiedData: Document[] =
    fileData?.map(file => {
      const {
        id,
        name: fileName,
        metadata,
        directory,
        source,
        uploaded,
      } = file;
      return {
        id,
        fileName,
        metadata,
        directory,
        source,
        uploaded,
      };
    }) ?? [];

  return (
    <DocumentTable
      docs={modifiedData}
      docTypes={docTypes}
      handleDocumentClick={onItemClicked}
    />
  );
};

export default FileGroupingTable;
