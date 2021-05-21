import { EnsureNonEmptyResource, GridTable } from '@cognite/data-exploration';
import React from 'react';
import { FileFilterProps, FileInfo } from '@cognite/cdf-sdk-singleton';
import styled from 'styled-components';
import { ResultData, TableDataItem, ViewMode } from 'src/modules/Common/types';
import { ResultTableLoader } from './ResultTableLoader';
import { FileGridPreview } from '../../Common/Components/FileGridPreview/FileGridPreview';
import { MapView } from '../../Common/Components/MapView/MapView';
import { FileTableExplorer } from '../../Common/Components/FileTable/FileTableExplorer';

export const ExplorerSearchResults = ({
  selectedId,
  query = '',
  filter = {},
  onClick,
  currentView,
  onRowSelect,
}: {
  query?: string;
  selectedId?: number;
  filter?: FileFilterProps;
  onClick: (item: TableDataItem) => void;
  onRowSelect: (item: TableDataItem, selected: boolean) => void;
  currentView: ViewMode;
}) => {
  return (
    <>
      <TableContainer>
        <EnsureNonEmptyResource
          api="file"
          css={{ height: '100%', width: '100%' }}
        >
          <ResultTableLoader<FileInfo>
            css={{ height: '100%', width: '100%' }}
            type="file"
            filter={filter}
            query={query}
          >
            {(props: { data: ResultData[]; totalCount: number }) => {
              const renderView = () => {
                if (currentView === 'grid') {
                  return (
                    <GridTable
                      onItemClicked={onClick}
                      {...props}
                      renderCell={(cellProps: any) => (
                        <FileGridPreview {...cellProps} />
                      )}
                    />
                  );
                }
                if (currentView === 'map') {
                  return <MapView {...props} />;
                }

                return (
                  <FileTableExplorer
                    onRowSelect={onRowSelect}
                    onRowClick={onClick}
                    selectedFileId={selectedId}
                    {...props}
                  />
                );
              };
              return <>{renderView()}</>;
            }}
          </ResultTableLoader>
        </EnsureNonEmptyResource>
      </TableContainer>
    </>
  );
};

const TableContainer = styled.div`
  width: 100%;
  height: calc(100% - 104px);
  overflow: hidden;
`;
