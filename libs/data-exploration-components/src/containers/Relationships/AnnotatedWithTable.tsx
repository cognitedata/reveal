import React, { useMemo, useState } from 'react';
import {
  SelectableItemsProps,
  ResourceItem,
} from '@data-exploration-components/types';
import { FileInfo, IdEither } from '@cognite/sdk';
import { useFilesAnnotatedWithResource } from '@data-exploration-components/hooks/RelationshipHooks';
import uniqBy from 'lodash/uniqBy';
import { ANNOTATION_METADATA_PREFIX as PREFIX } from '@cognite/annotations';
import { Alert } from 'antd';
import { Loader } from '@data-exploration-components/components';
import { FileTable } from '@data-exploration-components/containers';
import { useUniqueCdfItems } from '@data-exploration-components/hooks';
import {
  FileSwitcherWrapper,
  GroupingTableContainer,
  GroupingTableHeader,
} from './elements';
import { FileViewSwitcher } from '../SearchResults/FileSearchResults/FileViewSwitcher';
import FileGroupingTable from '../Files/FileGroupingTable/FileGroupingTable';

export const AnnotatedWithTable = ({
  resource,
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

  const {
    data: annotations,
    isFetched,
    isError,
  } = useFilesAnnotatedWithResource(resource);

  const ids = useMemo(
    () =>
      uniqBy(
        annotations.map(({ metadata = {} }) => {
          if (metadata[`${PREFIX}file_external_id`]) {
            return {
              externalId: metadata[`${PREFIX}file_external_id`],
            };
          }
          if (metadata[`${PREFIX}file_id`]) {
            return { id: parseInt(metadata[`${PREFIX}file_id`], 10) };
          }
          return undefined;
        }),
        (
          i:
            | { id: number; externalId: undefined }
            | { id: undefined; externalId: string }
            | undefined
        ) => i?.externalId || i?.id
      ).filter(Boolean) as IdEither[],
    [annotations]
  );

  const itemsEnabled = ids && ids.length > 0;

  const {
    data: items = [],
    isLoading: itemsLoading,
    isError: itemsError,
  } = useUniqueCdfItems<FileInfo>('files', ids, true);

  if (isError || itemsError) {
    return <Alert type="warning" message="Error fetching files" />;
  }

  if (!isFetched || (itemsLoading && itemsEnabled)) {
    return <Loader />;
  }

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
            currentView={currentView}
            setCurrentView={setCurrentView}
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
