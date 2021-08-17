/* eslint-disable @cognite/no-number-z-index */
import React from 'react';
import { Button, SegmentedControl, Popconfirm } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  selectAllFiles,
  selectAllSelectedFiles,
} from 'src/modules/Common/filesSlice';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { selectIsPollingComplete } from 'src/modules/Process/processSlice';

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

  return (
    <>
      <Container>
        {!!processFilesLength && ( // Only show buttons if there are files available
          <ButtonContainer>
            <ConfirmDeleteButton
              onConfirm={onDelete}
              selectedNumber={selectedFiles.length}
              disabled={!selectedFiles.length || !isPollingFinished}
            />
            <SegmentedControl
              onButtonClicked={onViewChange}
              currentKey={currentView}
              style={{ zIndex: 1 }}
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

const ConfirmDeleteButton = (props: {
  selectedNumber: number;
  onConfirm: () => void;
  disabled: boolean;
}) => (
  <DeleteButton>
    <Popconfirm
      icon="WarningFilled"
      placement="bottom-end"
      onConfirm={props.onConfirm}
      content="Are you sure you want to permanently delete this file?"
    >
      <Button
        type="ghost-danger"
        icon="Trash"
        iconPlacement="left"
        disabled={props.disabled}
        style={
          // not available in cogs yet
          props.disabled
            ? {
                color: '#b30539',
                background: 'rgba(255, 255, 255, 0.0001)',
                opacity: 0.4,
              }
            : undefined
        }
      >
        Delete [{props.selectedNumber || 0}]
      </Button>
    </Popconfirm>
  </DeleteButton>
);

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

const DeleteButton = styled.div`
  margin-right: 10px;
`;

const ButtonContainer = styled.div`
  display: flex;
`;
