import React, { useState } from 'react';

import { FileGroupingTable } from '@data-exploration/containers';
import { FileTable } from '@data-exploration-components/containers';
import {
  SelectableItemsProps,
  ResourceItem,
} from '@data-exploration-components/types';

import { FileInfo } from '@cognite/sdk';

import { FileViewSwitcher } from '../SearchResults/FileSearchResults/FileViewSwitcher';

import {
  FileSwitcherWrapper,
  GroupingTableContainer,
  GroupingTableHeader,
} from './elements';

export const AnnotatedWithTable = ({
  onItemClicked,
  isGroupingFilesEnabled,
}: {
  resource: ResourceItem;
  onItemClicked: (id: number) => void;
  isGroupingFilesEnabled?: boolean;
} & SelectableItemsProps) => {
  const [currentView, setCurrentView] = useState<string>(
    isGroupingFilesEnabled ? 'tree' : 'list'
  );

  const items: FileInfo[] = [];

  return (
    <>
      {currentView === 'tree' && (
        <GroupingTableContainer>
          <GroupingTableHeader>
            <FileViewSwitcher
              currentView={currentView}
              setCurrentView={setCurrentView}
            />
          </GroupingTableHeader>
          <FileGroupingTable
            data={items}
            onItemClicked={(file) => onItemClicked(file.id)}
          />
        </GroupingTableContainer>
      )}
      {currentView === 'list' && (
        <FileTable
          id="file-appear-in-table"
          data={items}
          onRowClick={({ id }) => onItemClicked(id)}
          tableHeaders={
            <FileSwitcherWrapper>
              {isGroupingFilesEnabled && (
                <FileViewSwitcher
                  setCurrentView={setCurrentView}
                  currentView={currentView}
                />
              )}
            </FileSwitcherWrapper>
          }
        />
      )}
    </>
  );
};
