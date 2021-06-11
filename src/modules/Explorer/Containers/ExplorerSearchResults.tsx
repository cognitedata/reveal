import { EnsureNonEmptyResource } from '@cognite/data-exploration';
import React from 'react';
import { FileFilterProps, FileInfo } from '@cognite/cdf-sdk-singleton';
import styled from 'styled-components';
import {
  ResultData,
  SelectFilter,
  TableDataItem,
  ViewMode,
} from 'src/modules/Common/types';
import { PageBasedGridView } from 'src/modules/Common/Components/GridView/PageBasedGridView';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  selectExplorerAllFilesSelected,
  selectExplorerSelectedIds,
} from 'src/modules/Explorer/store/explorerSlice';
import { VisionMode } from 'src/constants/enums/VisionEnums';
import { setSelectedAllFiles } from 'src/store/commonActions';
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
  const dispatch = useDispatch();
  const allFilesSelected = useSelector((state: RootState) =>
    selectExplorerAllFilesSelected(state.explorerReducer)
  );

  const selectedFileIds = useSelector((state: RootState) =>
    selectExplorerSelectedIds(state.explorerReducer)
  );
  const handleSelectAllFiles = (
    value: boolean,
    selectFilter?: SelectFilter
  ) => {
    dispatch(
      setSelectedAllFiles({ selectStatus: value, filter: selectFilter })
    );
  };

  return (
    <ResultContainer>
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
                  <PageBasedGridView
                    selectedIds={selectedFileIds}
                    onItemClicked={onClick}
                    onSelect={onRowSelect}
                    {...props}
                    renderCell={(cellProps: any) => (
                      <FileGridPreview
                        mode={VisionMode.Explore}
                        {...cellProps}
                      />
                    )}
                  />
                );
              }
              if (currentView === 'map') {
                return (
                  <MapView
                    onRowSelect={onRowSelect}
                    onRowClick={onClick}
                    selectedFileId={selectedId}
                    allRowsSelected={allFilesSelected}
                    onSelectAllRows={handleSelectAllFiles}
                    selectedRowIds={selectedFileIds}
                    {...props}
                  />
                );
              }
              if (currentView === 'modal') {
                return (
                  <FileTableExplorer
                    modalView
                    onRowSelect={onRowSelect}
                    onRowClick={onClick}
                    selectedFileId={selectedId}
                    allRowsSelected={allFilesSelected}
                    onSelectAllRows={handleSelectAllFiles}
                    selectedRowIds={selectedFileIds}
                    {...props}
                  />
                );
              }

              return (
                <FileTableExplorer
                  onRowSelect={onRowSelect}
                  onRowClick={onClick}
                  selectedFileId={selectedId}
                  allRowsSelected={allFilesSelected}
                  onSelectAllRows={handleSelectAllFiles}
                  selectedRowIds={selectedFileIds}
                  {...props}
                />
              );
            };
            return <>{renderView()}</>;
          }}
        </ResultTableLoader>
      </EnsureNonEmptyResource>
    </ResultContainer>
  );
};

const ResultContainer = styled.div`
  width: 100%;
  height: 100%;
`;
