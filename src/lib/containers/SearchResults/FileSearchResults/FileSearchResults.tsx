import React, { useState } from 'react';
import { FileFilterProps, FileInfo } from '@cognite/sdk';
import { FileGridPreview, FileTable } from 'lib/containers/Files';
import { SelectableItemsProps } from 'lib/CommonProps';
import { SearchResultLoader } from 'lib';
import { GridTable } from 'lib/components';
import { FileToolbar } from './FileToolbar';

export const FileSearchResults = ({
  query = '',
  filter = {},
  items,
  allowEdit = false,
  onClick,
  ...selectionProps
}: {
  query?: string;
  items?: FileInfo[];
  filter?: FileFilterProps;
  allowEdit?: boolean;
  onClick: (item: FileInfo) => void;
} & SelectableItemsProps) => {
  const [currentView, setCurrentView] = useState<string>('list');

  return (
    <>
      <FileToolbar
        query={query}
        filter={filter}
        onFileClicked={file => {
          onClick(file);
          return true;
        }}
        currentView={currentView}
        onViewChange={setCurrentView}
        allowEdit={allowEdit}
        count={items ? items.length : undefined}
      />
      <SearchResultLoader<FileInfo>
        type="file"
        filter={filter}
        query={query}
        {...selectionProps}
      >
        {props =>
          currentView === 'grid' ? (
            <div style={{ flex: 1 }}>
              <GridTable
                {...props}
                data={items || props.data}
                onEndReached={() => props.onEndReached!({ distanceFromEnd: 0 })}
                onItemClicked={file => onClick(file)}
                {...selectionProps}
                renderCell={cellProps => <FileGridPreview {...cellProps} />}
              />
            </div>
          ) : (
            <div style={{ flex: 1 }}>
              <FileTable
                {...props}
                data={items || props.data}
                onRowClick={file => {
                  onClick(file);
                  return true;
                }}
              />
            </div>
          )
        }
      </SearchResultLoader>
    </>
  );
};
