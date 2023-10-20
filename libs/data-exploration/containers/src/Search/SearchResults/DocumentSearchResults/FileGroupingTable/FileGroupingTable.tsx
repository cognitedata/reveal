import { useMemo } from 'react';

import {
  EmptyState,
  LoadMore,
  LoadMoreButtonWrapper,
} from '@data-exploration/components';
import isEmpty from 'lodash/isEmpty';

import {
  Document as TableDocument,
  DocumentTable,
} from '@cognite/react-document-table';
import { FileInfo, Document } from '@cognite/sdk';

import {
  FileWithRelationshipLabels,
  InternalDocument,
} from '@data-exploration-lib/core';
import { WithDetailViewData } from '@data-exploration-lib/domain-layer';

import { docTypes } from './docTypes';

type FileGroupingTableProps = {
  data?:
    | FileWithRelationshipLabels[]
    | WithDetailViewData<FileInfo>[]
    | WithDetailViewData<Document>[]
    | InternalDocument[];
  onItemClicked?: (file: any) => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
  fetchMore?: (...args: any[]) => any;
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
  hasNextPage,
  isLoading,
  fetchMore,
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
      } = document as WithDetailViewData<Document> | InternalDocument;

      return { id, metadata, directory, source, name };
    });

    return convertFilesToDocs(files);
  }, [data]);

  if (isEmpty(docs)) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <>
      <DocumentTable
        docs={docs}
        docTypes={docTypes}
        handleDocumentClick={onItemClicked}
      />

      <LoadMoreButtonWrapper justifyContent="center" alignItems="center">
        <LoadMore
          hasNextPage={hasNextPage}
          isLoadingMore={isLoading}
          fetchMore={fetchMore}
        />
      </LoadMoreButtonWrapper>
    </>
  );
};
