import React, { useState } from 'react';
import { FilesSearchFilter, FileFilterProps, FileInfo } from '@cognite/sdk';
import { useResourcePreview } from 'lib/context';
import { FileFilterGridTable } from 'lib/containers/Files';
import { SearchResultTable } from 'lib/components/Search/SearchPageTable';
import { FileToolbar } from './FileToolbar';
import { SelectableItemsProps } from '../../../CommonProps';

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

export const FileSearchResults = ({
  query = '',
  filter,
  ...selectableProps
}: { query?: string; filter: FileFilterProps } & SelectableItemsProps) => {
  const [currentView, setCurrentView] = useState<string>('list');
  const { openPreview } = useResourcePreview();

  return (
    <>
      <FileToolbar
        query={query}
        filter={filter}
        onFileClicked={file => {
          openPreview({ item: { id: file.id, type: 'file' } });
          return true;
        }}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      {currentView === 'grid' ? (
        <FileFilterGridTable
          filter={filter}
          query={query}
          onRowClick={file =>
            openPreview({ item: { id: file.id, type: 'file' } })
          }
          {...selectableProps}
        />
      ) : (
        <SearchResultTable<FileInfo>
          api="files"
          filter={filter}
          query={query}
          onRowClick={file => {
            openPreview({ item: { id: file.id, type: 'file' } });
            return true;
          }}
          {...selectableProps}
        />
      )}
    </>
  );
};
