import React, { useState } from 'react';
import { FileFilterProps, FileInfo } from '@cognite/sdk';
import { FileGridPreview, FileTable } from 'containers/Files';
import {
  SelectableItemsProps,
  TableStateProps,
  DateRangeProps,
} from 'CommonProps';
import { GridTable, EnsureNonEmptyResource } from 'components';
import { ResultTableLoader } from 'containers/ResultTableLoader';
import { RelatedResourceType } from 'hooks/RelatedResourcesHooks';
import { ResourceItem } from 'types';
import FileGroupingTable from 'containers/Files/FileGroupingTable/FileGroupingTable';
import { FileToolbar } from './FileToolbar';

export const FileSearchResults = ({
  query = '',
  filter = {},
  showRelatedResources = false,
  relatedResourceType,
  parentResource,
  count,
  isGroupingFilesEnabled,
  allowEdit = false,
  onClick,
  ...extraProps
}: {
  query?: string;
  items?: FileInfo[];
  filter?: FileFilterProps;
  showRelatedResources?: boolean;
  relatedResourceType?: RelatedResourceType;
  parentResource?: ResourceItem;
  count?: number;
  allowEdit?: boolean;
  isGroupingFilesEnabled?: boolean;
  onClick: (item: FileInfo) => void;
} & SelectableItemsProps &
  TableStateProps &
  DateRangeProps) => {
  const [currentView, setCurrentView] = useState<string>(() => {
    if (
      Boolean(parentResource) &&
      relatedResourceType === 'linkedResource' &&
      isGroupingFilesEnabled
    ) {
      return 'tree';
    }
    return 'list';
  });

  return (
    <>
      <FileToolbar
        isHaveParent={Boolean(parentResource)}
        relatedResourceType={relatedResourceType}
        query={query}
        isGroupingFilesEnabled={isGroupingFilesEnabled}
        filter={filter}
        onFileClicked={file => {
          onClick(file);
          return true;
        }}
        currentView={currentView}
        onViewChange={setCurrentView}
        allowEdit={allowEdit}
        count={count}
      />
      <EnsureNonEmptyResource api="file">
        <ResultTableLoader<FileInfo>
          type="file"
          mode={showRelatedResources ? 'relatedResources' : 'search'}
          filter={filter}
          query={query}
          parentResource={parentResource}
          relatedResourceType={relatedResourceType}
          {...extraProps}
        >
          {props => {
            if (currentView === 'grid')
              return (
                <GridTable
                  {...props}
                  onEndReached={() =>
                    props.onEndReached!({ distanceFromEnd: 0 })
                  }
                  onItemClicked={file => onClick(file)}
                  {...extraProps}
                  renderCell={cellProps => <FileGridPreview {...cellProps} />}
                />
              );

            if (currentView === 'tree')
              return (
                <FileGroupingTable
                  parentResource={parentResource}
                  onItemClicked={file => onClick(file)}
                />
              );
            return (
              <FileTable
                {...props}
                onRowClick={file => {
                  onClick(file);
                  return true;
                }}
                relatedResourceType={relatedResourceType}
              />
            );
          }}
        </ResultTableLoader>
      </EnsureNonEmptyResource>
    </>
  );
};
