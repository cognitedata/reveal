/* eslint-disable @cognite/no-number-z-index */
import React from 'react';
import { SegmentedControl } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  selectAllFiles,
  selectAllSelectedFiles,
} from 'src/modules/Common/filesSlice';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { selectIsPollingComplete } from 'src/modules/Process/processSlice';
import { BulkActionMenu } from 'src/modules/Common/Components/BulkActionMenu/BulkActionMenu';
import {
  setBulkEditModalVisibility,
  setFileDownloadModalVisibility,
} from 'src/modules/Common/commonSlice';

export const FileToolbar = ({
  onViewChange,
  currentView = 'list',
}: {
  onViewChange?: (view: string) => void;
  currentView?: string;
}) => {
  const dispatch = useDispatch();

  const selectedFiles = useSelector((state: RootState) =>
    selectAllSelectedFiles(state.filesSlice)
  );

  const processFilesLength = useSelector(
    (state: RootState) => selectAllFiles(state.filesSlice).length
  );

  const isPollingFinished = useSelector((state: RootState) => {
    return selectIsPollingComplete(state.processSlice);
  });

  const onDelete = () => {
    dispatch(
      deleteFilesById(
        selectedFiles.map((file) => {
          return { id: file.id };
        })
      )
    );
  };

  const onDownload = () => {
    dispatch(setFileDownloadModalVisibility(true));
  };

  const onBulkEdit = () => {
    dispatch(setBulkEditModalVisibility(true));
  };

  return (
    <>
      <Container>
        {!!processFilesLength && ( // Only show buttons if there are files available
          <ButtonContainer>
            <BulkActionMenu
              selectedCount={selectedFiles.length}
              maxSelectCount={processFilesLength}
              onBulkEdit={onBulkEdit}
              onDownload={onDownload}
              onDelete={onDelete}
              processingFiles={!isPollingFinished}
              style={{ zIndex: 1 }}
            />
            <SegmentedControl
              onButtonClicked={onViewChange}
              currentKey={currentView}
              style={{ zIndex: 1, marginLeft: '8px' }}
            >
              <SegmentedControl.Button
                key="list"
                icon="List"
                title="List"
                size="small"
              >
                List
              </SegmentedControl.Button>
              <SegmentedControl.Button
                key="grid"
                icon="Grid"
                title="Grid"
                size="small"
              >
                Grid
              </SegmentedControl.Button>

              <SegmentedControl.Button
                key="map"
                icon="Map"
                title="Map"
                size="small"
              >
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
`;
