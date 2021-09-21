import { ExploreModal } from 'src/modules/Common/Components/ExploreModal/ExploreModal';
import { FileState } from 'src/modules/Common/store/filesSlice';
import {
  selectAllProcessFiles,
  setProcessFileIds,
  setSelectFromExploreModalVisibility,
} from 'src/modules/Process/processSlice';
import {
  clearExplorerStateOnTransition,
  selectExplorerAllSelectedFiles,
  selectExplorerSelectedFileIds,
  setExplorerFileSelectState,
  setExplorerFilter,
  setExplorerFocusedFileId,
  setExplorerQueryString,
} from 'src/modules/Explorer/store/explorerSlice';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { TableDataItem } from 'src/modules/Common/types';
import { FileFilterProps } from '@cognite/cdf-sdk-singleton';
import { AppDispatch } from 'src/store';

export const ExploreModalContainer = () => {
  const dispatch: AppDispatch = useDispatch();

  const processFiles = useSelector((state: RootState) =>
    selectAllProcessFiles(state)
  );

  const showSelectFromExploreModal = useSelector(
    ({ processSlice }: RootState) => processSlice.showExploreModal
  );
  const exploreModalFocusedFileId = useSelector(
    (state: RootState) => state.explorerReducer.focusedFileId
  );
  const exploreModalSearchQuery = useSelector(
    (state: RootState) => state.explorerReducer.query
  );
  const filter = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.filter
  );
  const selectedExploreModalFiles: FileState[] = useSelector(
    (state: RootState) => {
      return selectExplorerAllSelectedFiles(state.explorerReducer);
    }
  );
  const selectedExistingFileIds = useSelector((state: RootState) =>
    selectExplorerSelectedFileIds(state.explorerReducer)
  );
  const handleExploreSearchChange = (text: string) => {
    dispatch(setExplorerQueryString(text));
  };

  const handleExplorerModalItemClick = ({
    /* eslint-disable @typescript-eslint/no-unused-vars */
    menuActions,
    rowKey,
    /* eslint-enable @typescript-eslint/no-unused-vars */
    ...file
  }: TableDataItem) => {
    dispatch(setExplorerFocusedFileId(file.id));
  };
  const handleExploreModalRowSelect = (
    item: TableDataItem,
    selected: boolean
  ) => {
    dispatch(setExplorerFileSelectState(item.id, selected));
  };
  const setFilter = (newFilter: FileFilterProps) => {
    dispatch(setExplorerFilter(newFilter));
  };
  const handleUseFiles = () => {
    const availableFileIds = processFiles.map((file) => file.id);
    const allProcessFileIds = [...availableFileIds];
    selectedExploreModalFiles.forEach((selectedExploreFile) => {
      if (
        !availableFileIds.find((fileId) => fileId === selectedExploreFile.id)
      ) {
        allProcessFileIds.push(selectedExploreFile.id);
      }
    });

    dispatch(setProcessFileIds(allProcessFileIds));
    dispatch(setSelectFromExploreModalVisibility(false));
  };

  return (
    <ExploreModal
      showModal={showSelectFromExploreModal}
      focusedId={exploreModalFocusedFileId}
      query={exploreModalSearchQuery}
      filter={filter}
      selectedCount={selectedExistingFileIds.length}
      selectedIds={selectedExistingFileIds}
      setFilter={setFilter}
      onSearch={handleExploreSearchChange}
      onItemClick={handleExplorerModalItemClick}
      onRowSelect={handleExploreModalRowSelect}
      onCloseModal={() => {
        dispatch(setSelectFromExploreModalVisibility(false));
        dispatch(clearExplorerStateOnTransition());
      }}
      onUseFiles={handleUseFiles}
      processFileCount={processFiles.length}
    />
  );
};
