import React, { useContext } from 'react';
import { SearchResultTable } from 'lib/containers/SearchResults';
import { FilesSearchFilter, FileFilterProps, FileInfo } from '@cognite/sdk';
import { ResourceSelectionContext, useResourcePreview } from 'lib/context';
import { FileToolbar } from './FileToolbar';

export const buildFilesFilterQuery = (
  filter: FileFilterProps,
  query: string | undefined
): FilesSearchFilter => {
  return {
    ...(query &&
      query.length > 0 && {
        search: {
          name: query,
        },
      }),
    filter,
  };
};

export const FileSearchResults = ({ query = '' }: { query?: string }) => {
  const { fileFilter } = useContext(ResourceSelectionContext);
  const { openPreview } = useResourcePreview();

  return (
    <>
      <FileToolbar
        onFileClicked={file => {
          openPreview({ item: { id: file.id, type: 'file' } });
          return true;
        }}
      />
      <SearchResultTable<FileInfo>
        api="files"
        filter={fileFilter}
        query={query}
        onRowClick={file =>
          openPreview({ item: { id: file.id, type: 'file' } })
        }
      />
    </>
  );
};
