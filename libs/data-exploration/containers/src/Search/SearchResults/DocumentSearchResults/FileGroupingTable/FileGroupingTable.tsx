import { useMemo } from 'react';

import {
  Document as TableDocument,
  DocumentTable,
} from '@cognite/react-document-table';
import { FileInfo, Document } from '@cognite/sdk';

import { FileWithRelationshipLabels } from '@data-exploration-lib/core';
import { WithDetailViewData } from '@data-exploration-lib/domain-layer';

import { docTypes } from './docTypes';

type FileGroupingTableProps = {
  data?:
    | FileWithRelationshipLabels[]
    | WithDetailViewData<FileInfo>[]
    | WithDetailViewData<Document>[];
  onItemClicked?: (file: any) => void;
};
const convertFilesToDocs = <
  T extends Pick<FileInfo, 'id' | 'name' | 'metadata' | 'directory' | 'source'>
>(
  files: T[] = []
): TableDocument[] => {
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
  data = [],
  onItemClicked,
}: FileGroupingTableProps) => {
  const docs: TableDocument[] = useMemo(() => {
    const files = data.map((document) => {
      if ('metadata' in document) {
        const { id, metadata, directory, source, name } = document;
        return { id, metadata, directory, source, name };
      }

      const {
        id,
        sourceFile: { metadata, directory, source, name },
      } = document as WithDetailViewData<Document>;

      return { id, metadata, directory, source, name };
    });

    return convertFilesToDocs(files);
  }, [data]);

  return (
    <DocumentTable
      docs={docs}
      docTypes={docTypes}
      handleDocumentClick={onItemClicked}
    />
  );
};
