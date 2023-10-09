import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { message, notification } from 'antd';

import { Button, Title, Modal } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import { AutoMLAPI } from '../../../../api/vision/autoML/AutoMLAPI';
import { AutoMLModelCore } from '../../../../api/vision/autoML/types';
import { VisionDetectionModelType } from '../../../../api/vision/detectionModels/types';
import { useThunkDispatch } from '../../../../store';
import { RootState } from '../../../../store/rootReducer';
import { RunDetectionModels } from '../../../../store/thunks/Process/RunDetectionModels';
import { getContainer } from '../../../../utils';
import { zIndex } from '../../../../utils/zIndex';
import { isVideo } from '../../../Common/Components/FileUploader/utils/FileUtils';
import { DetectionModelSelect } from '../../Components/DetectionModelSelect';
import {
  selectAllProcessFiles,
  selectIsPollingComplete,
  selectIsProcessingStarted,
} from '../../store/selectors';
import {
  setDetectionModelParameters,
  setProcessViewFileUploadModalVisibility,
  setSelectedDetectionModels,
  setSelectFromExploreModalVisibility,
  resetDetectionModelParameters,
  addToAvailableDetectionModels,
} from '../../store/slice';
import { ModelConfiguration } from '../ModelConfiguration';

import ProgressStatus from './ProgressStatus';

export const ProcessToolBar = () => {
  const visionAutoMLEnabled = useFlag('VISION_AutoML', {
    fallback: false,
    forceRerender: true,
  });
  const disabledModelTypes: VisionDetectionModelType[] = [];
  if (!visionAutoMLEnabled)
    disabledModelTypes.push(VisionDetectionModelType.CustomModel);

  const dispatch = useThunkDispatch();

  const processFiles = useSelector((state: RootState) =>
    selectAllProcessFiles(state)
  );

  const isPollingFinished = useSelector((state: RootState) => {
    return selectIsPollingComplete(state.processSlice);
  });

  const isProcessingStarted = useSelector((state: RootState) => {
    return selectIsProcessingStarted(state.processSlice);
  });

  const selectedDetectionModels = useSelector(
    (state: RootState) => state.processSlice.selectedDetectionModels
  );

  const onDetectClick = () => {
    if (!selectedDetectionModels.length) {
      message.error('Please select ML models to use for detection');
      return;
    }

    if (processFiles.filter((file) => isVideo(file)).length) {
      notification.warning({
        message: 'Skipping video files',
        description:
          'Automatic contextualization is currently not supported for videos.',
      });
    }
    dispatch(
      RunDetectionModels({
        fileIds: processFiles
          .filter((file) => !isVideo(file))
          .map(({ id }) => id),
        detectionModels: selectedDetectionModels,
      })
    );
  };

  const onChange = (models: Array<VisionDetectionModelType>) => {
    dispatch(setSelectedDetectionModels(models));
  };

  const [isModalOpen, setModalOpen] = useState(false);
  const [customModels, setCustomModels] = useState<
    AutoMLModelCore[] | undefined
  >();

  const disableAddFiles = !isPollingFinished;
  const disableModelSelection = !processFiles.length || !isPollingFinished;
  const fileUploadActive = !processFiles.length;
  const modelSelectorActive =
    !!processFiles.length &&
    !selectedDetectionModels.length &&
    isPollingFinished;

  const handleCustomModelCreate = () => {
    dispatch(addToAvailableDetectionModels());
    setModalOpen(true);
  };

  const detectionModelConfiguration = () => {
    return (
      <ConfigurationModelFooter>
        <Button
          type="primary"
          onClick={() => {
            setModalOpen(false);
            dispatch(setDetectionModelParameters());
          }}
        >
          Save & close
        </Button>
        <Button
          type="tertiary"
          onClick={() => {
            dispatch(resetDetectionModelParameters());
          }}
        >
          Reset to default
        </Button>
      </ConfigurationModelFooter>
    );
  };

  useEffect(() => {
    const getModels = async () => {
      const models = await AutoMLAPI.listAutoMLModels();
      setCustomModels(models);
    };
    if (visionAutoMLEnabled) getModels();
  }, []);

  return (
    <Container>
      <StyledModal
        title="Processing and annotation settings"
        visible={isModalOpen}
        closable={false}
        getContainer={getContainer}
        hideFooter={true}
      >
        <ModalContentWrapper>
          <ModelConfiguration
            disabledModelTypes={disabledModelTypes}
            customModels={customModels}
            handleCustomModelCreate={() => {
              dispatch(addToAvailableDetectionModels());
            }}
          />
          {/* Adding a customer footer as Cogs Ok and Cancel buttons are not working */}
          {detectionModelConfiguration()}
        </ModalContentWrapper>
      </StyledModal>
      <ToolContainer>
        <ProcessToolBarElement
          disabled={disableAddFiles}
          active={fileUploadActive}
        >
          <ElementTitle>
            <Title level={6}>Add files</Title>
          </ElementTitle>
          <ElementContent>
            <Button
              type="tertiary"
              icon="Upload"
              disabled={disableAddFiles}
              onClick={() =>
                dispatch(setProcessViewFileUploadModalVisibility(true))
              }
            >
              Upload
            </Button>
            <Button
              type="tertiary"
              icon="Add"
              disabled={disableAddFiles}
              onClick={() =>
                dispatch(setSelectFromExploreModalVisibility(true))
              }
            >
              Select from files
            </Button>
          </ElementContent>
        </ProcessToolBarElement>
      </ToolContainer>
      <ToolContainer>
        <ProcessToolBarElement
          disabled={disableModelSelection}
          active={modelSelectorActive}
        >
          <ElementTitle>
            <Title level={6}>Select ML model(s)</Title>
            <ModelSettingsButton
              icon="Settings"
              aria-label="model settings"
              disabled={disableModelSelection}
              onClick={() => {
                setModalOpen(true);
              }}
            />
          </ElementTitle>
          <ElementContent>
            <ModelOptions>
              <ModelSelector>
                <DetectionModelSelect
                  value={selectedDetectionModels}
                  onChange={onChange}
                  handleCustomModelCreate={handleCustomModelCreate}
                  handleOpenSettingsWindow={() => {
                    setModalOpen(true);
                  }}
                  disabledModelTypes={disabledModelTypes}
                  isDisabled={disableModelSelection}
                />
              </ModelSelector>
              <Button
                data-testid="Detect Button"
                type="primary"
                disabled={!isPollingFinished || processFiles.length === 0}
                onClick={onDetectClick}
              >
                Detect
              </Button>
            </ModelOptions>
          </ElementContent>
        </ProcessToolBarElement>
      </ToolContainer>
      {isProcessingStarted && (
        <ToolContainer style={{ justifySelf: 'end' }}>
          <ProgressStatus />
        </ToolContainer>
      )}
    </Container>
  );
};
const Container = styled.div`
  display: grid;
  width: 100%;
  padding-top: 20px;
  padding-bottom: 15px;
  grid-gap: 25px;
  grid-template-columns: max-content max-content 1fr;
`;

const ModalContentWrapper = styled.div`
  display: grid;
  gap: 20px;
`;

const StyledModal = styled(Modal)`
  width: 850px;
`;

type ToolBarElemProps = {
  disabled: boolean;
  active: boolean;
};
const ProcessToolBarElement = styled.div<ToolBarElemProps>`
  padding: 10px;
  box-sizing: border-box;
  border-radius: 10px;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  background: ${(props) =>
    props.active ? 'rgba(74, 103, 251, 0.1)' : '#fafafa'};
  border: 0.5px solid ${(props) => (props.active ? '#4a67fb' : '#dcdcdc')};
`;

const ToolContainer = styled.div`
  display: flex;
  width: fit-content;
  z-index: ${zIndex.TOOLBAR};
`;

const ElementTitle = styled.div`
  display: flex;
  width: 100%;
  box-sizing: content-box;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;
const ElementContent = styled.div`
  display: flex;
  gap: 8px;
`;

const ModelSettingsButton = styled(Button)`
  color: #c4c4c4;
  background: inherit;
  padding: 0;
  height: 12px;
`;
const ModelSelector = styled.div`
  padding-right: 15px;
  min-width: 340px;
  max-width: 550px;
`;

const ModelOptions = styled.div`
  display: flex;
  flex-direction: row;
`;

const ConfigurationModelFooter = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: flex-start;
`;
