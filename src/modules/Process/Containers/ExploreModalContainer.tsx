import React from 'react';
import { ExploreModal } from 'src/modules/Common/Components/ExploreModal/ExploreModal';
import {
  selectAllProcessFiles,
  setProcessFileIds,
  setSelectFromExploreModalVisibility,
} from 'src/modules/Process/processSlice';
import {
  setExplorerFileSelectState,
  setExplorerModalFocusedFileId,
  setExplorerModalQueryString,
} from 'src/modules/Explorer/store/slice';
import { selectExplorerSelectedFileIdsInSortedOrder } from 'src/modules/Explorer/store/selectors';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { TableDataItem } from 'src/modules/Common/types';
import { FileFilterProps } from '@cognite/sdk';
import { AppDispatch } from 'src/store';
import { ClearExplorerStateOnTransition } from 'src/store/thunks/Explorer/ClearExplorerStateOnTransition';

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
    (state: RootState) => state.explorerReducer.exploreModal.query
  );
  const filter = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.exploreModal.filter
  );
  const selectedExistingFileIds = useSelector((state: RootState) =>
    selectExplorerSelectedFileIdsInSortedOrder(state)
  );
  const handleExploreSearchChange = (text: string) => {
    dispatch(setExplorerModalQueryString(text));
  };

  const handleExplorerModalItemClick = ({
    /* eslint-disable @typescript-eslint/no-unused-vars */
    menuActions,
    rowKey,
    /* eslint-enable @typescript-eslint/no-unused-vars */
    ...file
  }: TableDataItem) => {
    dispatch(setExplorerModalFocusedFileId(file.id));
  };
  const handleExploreModalRowSelect = (
    item: TableDataItem,
    selected: boolean
  ) => {
    dispatch(setExplorerFileSelectState({ fileId: item.id, selected }));
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setFilter = (newFilter: FileFilterProps) => {
    // Todo: Implement setExplorerModalFilter
  };
  const handleUseFiles = () => {
    const availableFileIds = processFiles.map((file) => file.id);
    const allProcessFileIds = [...availableFileIds];
    selectedExistingFileIds.forEach((selectedExistingFileId) => {
      if (
        !availableFileIds.find((fileId) => fileId === selectedExistingFileId)
      ) {
        allProcessFileIds.push(selectedExistingFileId);
      }
    });

    dispatch(setProcessFileIds(allProcessFileIds));
    dispatch(ClearExplorerStateOnTransition());
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
      onItemSelect={handleExploreModalRowSelect}
      onCloseModal={() => {
        dispatch(setSelectFromExploreModalVisibility(false));
        dispatch(ClearExplorerStateOnTransition());
      }}
      onUseFiles={handleUseFiles}
      processFileCount={processFiles.length}
    />
  );
};
