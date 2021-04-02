import React from 'react';
import { Button, ButtonGroup, Detail } from '@cognite/cogs.js';
import { DetectionModelSelect } from 'src/pages/Workflow/process/DetectionModelSelect';
import styled from 'styled-components';
import { useAnnotationJobs } from 'src/store/hooks/useAnnotationJobs';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  detectAnnotations,
  setSelectedDetectionModels,
} from 'src/store/processSlice';
import { DetectionModelType } from 'src/api/types';
import { selectAllFiles } from 'src/store/uploadedFilesSlice';
import { message } from 'antd';

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
    dispatch(
      detectAnnotations({
        fileIds: uploadedFiles.map(({ id }) => id),
        detectionModels: selectedDetectionModels,
      })
    );
  };

  const onChange = (models: Array<DetectionModelType>) => {
    dispatch(setSelectedDetectionModels(models));
  };

  const { isPollingFinished } = useAnnotationJobs();
  return (
    <>
      <Container>
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
      <HorizontalLine hidden={currentView === 'list'} />
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
  max-width: 340px;
  width: 340px;
`;

const ModelOptions = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
`;

const HorizontalLine = styled.div`
  border: 1px solid #e8e8e8;
  visibility: ${(props) => (props.hidden ? 'hidden' : 'visible')};
`;
