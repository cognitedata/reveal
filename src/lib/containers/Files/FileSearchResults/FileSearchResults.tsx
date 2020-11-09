import React, { useContext, useState } from 'react';
import { FilesSearchFilter, FileFilterProps, FileInfo } from '@cognite/sdk';
import { ResourceSelectionContext, useResourcePreview } from 'lib/context';
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
  ...selectableProps
}: { query?: string } & SelectableItemsProps) => {
  const [currentView, setCurrentView] = useState<string>('list');
  const { fileFilter } = useContext(ResourceSelectionContext);
  const { openPreview } = useResourcePreview();

  return (
    <>
      <FileToolbar
        query={query}
        filter={fileFilter}
        onFileClicked={file => {
          openPreview({ item: { id: file.id, type: 'file' } });
          return true;
        }}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      {currentView === 'grid' ? (
        <FileFilterGridTable
          filter={fileFilter}
          query={query}
          onRowClick={file =>
            openPreview({ item: { id: file.id, type: 'file' } })
          }
          {...selectableProps}
        />
      ) : (
        <SearchResultTable<FileInfo>
          api="files"
          filter={fileFilter}
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
