import React, { useMemo, useState } from 'react';
import { Button, Title, Graphic, Body, Tooltip } from '@cognite/cogs.js';
import { VisionFile } from 'src/modules/Common/store/files/types';
import styled from 'styled-components';
import { AutoMLModelType } from 'src/api/vision/autoML/types';
import { useHistory } from 'react-router-dom';
import { getLink, workflowRoutes } from 'src/utils/workflowRoutes';
import { AutoMLAPI } from 'src/api/vision/autoML/AutoMLAPI';
import { makeSelectAnnotationsForFileIds } from 'src/modules/Common/store/annotationV1/selectors';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { ModelTrainingSettings } from './ModelTrainingSettings';
import { ModelTrainingFileTable } from './ModelTrainingFileTable';
import { validateDataset } from './datasetValidators';

export type ModelTrainingModalContentProps = {
  selectedFiles: VisionFile[];
  onCancel: () => void;
};

export const ModelTrainingModalContent = ({
  selectedFiles,
  onCancel,
}: ModelTrainingModalContentProps) => {
  const [modelName, setModelName] = useState('Untitled model');
  const [modelType, setModelType] =
    useState<AutoMLModelType>('objectdetection');
  const [jobCreated, setJobCreated] = useState<boolean>(false);
  const [startAutoMLJobCalled, setStartAutoMLJobCalled] =
    useState<boolean>(false);

  const history = useHistory();

  const selectAnnotationsForFileIds = useMemo(
    makeSelectAnnotationsForFileIds,
    []
  );
  const annotationsMap = useSelector(({ annotationV1Reducer }: RootState) =>
    selectAnnotationsForFileIds(
      annotationV1Reducer,
      selectedFiles.map((item) => item.id)
    )
  );

  const onStartModelTraining = async () => {
    setStartAutoMLJobCalled(true);
    const data = await AutoMLAPI.startAutoMLJob(
      modelName,
      modelType,
      selectedFiles.map((item) => {
        return {
          fileId: item.id,
        };
      })
    );
    if (data) {
      // if job was successfully started
      setJobCreated(true);
    } else {
      setStartAutoMLJobCalled(false); // reset in case request failed
    }
  };

  const handleStartModelTraining = () => {
    if (!startAutoMLJobCalled) {
      onStartModelTraining();
    }
  };

  const handleOnClose = () => {
    setJobCreated(false);
    setStartAutoMLJobCalled(false);
    onCancel();
  };

  const handleGoToModelOverview = () => {
    history.push(getLink(workflowRoutes.models));
    onCancel();
  };

  const datasetValidation = validateDataset(selectedFiles, annotationsMap);
  const startModelTrainingDisabled =
    !modelName.length || !datasetValidation.valid;

  return jobCreated ? (
    <GraphicContainer>
      <Graphic type="Search" style={{ width: '291px' }} />
      <Title level={3} as="h1">
        Job created!
      </Title>
      <StyledBody strong>
        The job is queued and model generation is in progress. All jobs and
        models can be viewed in the model overview.
      </StyledBody>
      <ButtonContainer>
        <Button type="primary" onClick={handleGoToModelOverview}>
          Go to model overview
        </Button>
        <Button type="tertiary" onClick={handleOnClose}>
          Close
        </Button>
      </ButtonContainer>
    </GraphicContainer>
  ) : (
    <>
      <Title level={4} as="h1">
        Create computer vision model from files
      </Title>
      <BodyContainer>
        <ModelTrainingFileTable data={selectedFiles} />
        <ModelTrainingSettings
          modelName={modelName}
          onSetModelName={setModelName}
          onSetModelType={setModelType}
        />
      </BodyContainer>
      <Footer>
        <RightFooter>
          <Button
            type="tertiary"
            icon="XLarge"
            data-testid="cancel-button"
            onClick={handleOnClose}
          >
            Cancel
          </Button>

          <Tooltip
            content={
              <span data-testid="text-content">
                {datasetValidation.message}
              </span>
            }
            disabled={!datasetValidation.message}
          >
            <Button
              type="primary"
              icon="Upload"
              data-testid="start-training-button"
              onClick={handleStartModelTraining}
              disabled={startModelTrainingDisabled}
              loading={startAutoMLJobCalled}
            >
              Start training job
            </Button>
          </Tooltip>
        </RightFooter>
      </Footer>
    </>
  );
};

const GraphicContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;

const StyledBody = styled(Body)`
  color: #595959;
  max-width: 500px;
  align-items: flex-end;
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 180px;
  gap: 5px;
`;

const BodyContainer = styled.div`
  display: flex;
  flex-direction: row;
  grid-gap: 18px;
  margin: 17px 0px;
`;

const Footer = styled.div`
  display: grid;
  grid-auto-flow: column;
`;

const RightFooter = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-self: center;
  justify-self: end;
  grid-gap: 6px;
`;
