import React from 'react';
import { SegmentedControl } from '@cognite/cogs.js-old';
import {
  setBulkEditModalVisibility,
  setFileDownloadModalVisibility,
} from 'src/modules/Common/store/common/slice';
import { selectAllSelectedIds } from 'src/modules/Common/store/files/selectors';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { BulkActionMenu } from 'src/modules/Common/Components/BulkActionMenu/BulkActionMenu';
import {
  selectAllProcessFiles,
  selectIsPollingComplete,
} from 'src/modules/Process/store/selectors';
import { cancelFileDetailsEdit } from 'src/modules/FileDetails/slice';

export const FileToolbar = ({
  onViewChange,
  currentView = 'list',
}: {
  onViewChange?: (view: string) => void;
  currentView?: string;
}) => {
  const dispatch = useDispatch();

  const selectedFileIds = useSelector((state: RootState) =>
    selectAllSelectedIds(state.fileReducer)
  );

  const processFilesLength = useSelector(
    (state: RootState) => selectAllProcessFiles(state).length
  );

  const isPollingFinished = useSelector((state: RootState) => {
    return selectIsPollingComplete(state.processSlice);
  });

  const onDelete = (setIsDeletingState: (val: boolean) => void) => {
    dispatch(
      DeleteFilesById({
        fileIds: selectedFileIds,
        setIsDeletingState,
      })
    );
  };

  const onDownload = () => {
    dispatch(setFileDownloadModalVisibility(true));
  };

  const onBulkEdit = () => {
    dispatch(setBulkEditModalVisibility(true));
  };

  const handleCancelOtherEdits = () => {
    dispatch(cancelFileDetailsEdit());
  };

  return (
    <>
      <Container>
        {!!processFilesLength && ( // Only show buttons if there are files available
          <ButtonContainer style={{ zIndex: 1 }}>
            <BulkActionMenu
              selectedCount={selectedFileIds.length}
              maxSelectCount={processFilesLength}
              onBulkEdit={onBulkEdit}
              onDownload={onDownload}
              onDelete={onDelete}
              handleCancelOtherEdits={handleCancelOtherEdits}
              processingFiles={!isPollingFinished}
            />
            <SegmentedControl
              onButtonClicked={onViewChange}
              currentKey={currentView}
            >
              <SegmentedControl.Button key="list" icon="List" title="List">
                List
              </SegmentedControl.Button>
              <SegmentedControl.Button key="grid" icon="Grid" title="Gallery">
                Gallery
              </SegmentedControl.Button>

              <SegmentedControl.Button key="map" icon="Map" title="Map">
                Map
              </SegmentedControl.Button>
            </SegmentedControl>
          </ButtonContainer>
        )}
      </Container>
    </>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 15px 0;

  .cogs-input {
    min-width: 280px;
    border: 2px solid #d9d9d9;
    box-sizing: border-box;
    border-radius: 6px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
`;
