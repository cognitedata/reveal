import React from 'react';
import { Button, SegmentedControl, Detail, Popconfirm } from '@cognite/cogs.js';
import { DetectionModelSelect } from 'src/modules/Workflow/components/DetectionModelSelect';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  detectAnnotations,
  selectIsPollingComplete,
  setSelectedDetectionModels,
} from 'src/modules/Process/processSlice';
import {
  selectAllFiles,
  selectAllSelectedFiles,
} from 'src/modules/Common/filesSlice';
import { message, notification } from 'antd';
import { isVideo } from 'src/modules/Common/Components/FileUploader/utils/FileUtils';
import { toastProps } from 'src/utils/ToastUtils';
import { VisionAPIType } from 'src/api/types';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';

export const FileToolbar = ({
  onViewChange,
  currentView = 'list',
}: {
  onViewChange?: (view: string) => void;
  currentView?: string;
}) => {
  const dispatch = useDispatch();
  const uploadedFiles = useSelector((state: RootState) =>
    selectAllFiles(state.filesSlice)
  );
  const selectedDetectionModels = useSelector(
    (state: RootState) => state.processSlice.selectedDetectionModels
  );

  const selectedFiles = useSelector((state: RootState) =>
    selectAllSelectedFiles(state.filesSlice)
  );

  const isPollingFinished = useSelector((state: RootState) => {
    return selectIsPollingComplete(state.processSlice);
  });

  const showDrawer = useSelector(
    (state: RootState) => state.processSlice.showFileMetadataDrawer
  );

  const onDetectClick = () => {
    if (!selectedDetectionModels.length) {
      message.error('Please select ML models to use for detection');
      return;
    }

    if (uploadedFiles.filter((file) => isVideo(file)).length) {
      notification.warning({
        message: 'Skipping video files',
        description:
          'Automatic contextualization is currently not supported for videos.',
      });
    }
    dispatch(
      detectAnnotations({
        fileIds: uploadedFiles
          .filter((file) => !isVideo(file))
          .map(({ id }) => id),
        detectionModels: selectedDetectionModels,
      })
    );
  };

  const onChange = (models: Array<VisionAPIType>) => {
    dispatch(setSelectedDetectionModels(models));
  };

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
        {isPollingFinished || showDrawer
          ? notification.info({
              ...toastProps,
              duration: 0.01,
              style: { ...toastProps.style, visibility: 'collapse' },
            })
          : notification.info({ ...toastProps, duration: 0 })}

        <ModelOptions>
          <ModelSelector>
            <Detail strong>Select Machine Learning Model(s):</Detail>
            <DetectionModelSelect
              value={selectedDetectionModels}
              onChange={onChange}
            />
          </ModelSelector>
          <Button
            icon={isPollingFinished ? 'Scan' : 'Loading'}
            disabled={!isPollingFinished}
            onClick={onDetectClick}
            style={{
              background: 'var(--cogs-gradient-midnightblue)',
              color: '#fff',
            }}
          >
            Detect
          </Button>
        </ModelOptions>
        <ButtonContainer>
          <ConfirmDeleteButton
            onConfirm={onDelete}
            selectedNumber={selectedFiles.length}
            disabled={!selectedFiles.length || !isPollingFinished}
          />
          <SegmentedControl
            onButtonClicked={onViewChange}
            currentKey={currentView}
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
        icon="Delete"
        iconPlacement="left"
        disabled={props.disabled}
      >
        Delete [{props.selectedNumber || 0}]
      </Button>
    </Popconfirm>
  </DeleteButton>
);

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: bottom;
  padding: 15px 0;
  align-items: flex-end;
`;

const ModelSelector = styled.div`
  padding-right: 15px;
  max-width: 100%;
  min-width: 340px;
`;

const ModelOptions = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
`;

const DeleteButton = styled.div`
  margin-right: 10px;
`;

const ButtonContainer = styled.div`
  display: flex;
`;
