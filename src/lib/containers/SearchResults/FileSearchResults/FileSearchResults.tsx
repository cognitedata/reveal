import React, { useState } from 'react';
import { FileFilterProps, FileInfo } from '@cognite/sdk';
import { FileGridTable, FileTable } from 'lib/containers/Files';
import { SelectableItemsProps } from 'lib/CommonProps';
import { SearchResultLoader } from 'lib';
import { FileToolbar } from './FileToolbar';

export const FileSearchResults = ({
  query = '',
  filter,
  allowEdit = false,
  onClick,
  ...selectionProps
}: {
  query?: string;
  filter: FileFilterProps;
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
              <FileGridTable
                {...props}
                onEndReached={() => props.onEndReached!({ distanceFromEnd: 0 })}
                onItemClicked={file => onClick(file)}
                {...selectionProps}
              />
            </div>
          ) : (
            <FileTable
              {...props}
              onRowClick={file => {
                onClick(file);
                return true;
              }}
            />
          )
        }
      </SearchResultLoader>
    </>
  );
};
