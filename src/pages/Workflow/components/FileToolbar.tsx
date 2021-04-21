import React from 'react';
import { Button, ButtonGroup, Detail } from '@cognite/cogs.js';
import { DetectionModelSelect } from 'src/pages/Workflow/process/DetectionModelSelect';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  detectAnnotations,
  selectIsPollingComplete,
  setSelectedDetectionModels,
} from 'src/store/processSlice';
import { selectAllFiles } from 'src/store/uploadedFilesSlice';
import { message, notification } from 'antd';
import { isVideo } from 'src/components/FileUploader/utils/FileUtils';
import { toastProps } from 'src/utils/ToastUtils';
import { VisionAPIType } from 'src/api/types';

export const FileToolbar = ({
  onViewChange,
  currentView = 'list',
}: {
  onViewChange?: (view: string) => void;
  currentView?: string;
}) => {
  const dispatch = useDispatch();
  const uploadedFiles = useSelector((state: RootState) =>
    selectAllFiles(state.uploadedFiles)
  );
  const selectedDetectionModels = useSelector(
    (state: RootState) => state.processSlice.selectedDetectionModels
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

  const isPollingFinished = useSelector((state: RootState) => {
    return selectIsPollingComplete(state.processSlice);
  });

  const showDrawer = useSelector(
    (state: RootState) => state.processSlice.showFileMetadataDrawer
  );

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

        <ButtonGroup onButtonClicked={onViewChange} currentKey={currentView}>
          <ButtonGroup.Button key="list" icon="List" title="List" size="small">
            List
          </ButtonGroup.Button>
          <ButtonGroup.Button key="grid" icon="Grid" title="Grid" size="small">
            Grid
          </ButtonGroup.Button>
        </ButtonGroup>
      </Container>
    </>
  );
};

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
