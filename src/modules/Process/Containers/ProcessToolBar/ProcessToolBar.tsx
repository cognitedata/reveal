import { ModelConfiguration } from 'src/modules/Process/Containers/ModelConfiguration';
import { RunDetectionModels } from 'src/store/thunks/Process/RunDetectionModels';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  setDetectionModelParameters,
  setProcessViewFileUploadModalVisibility,
  setSelectedDetectionModels,
  setSelectFromExploreModalVisibility,
  resetDetectionModelParameters,
  addToAvailableDetectionModels,
} from 'src/modules/Process/store/slice';
import {
  selectAllProcessFiles,
  selectIsPollingComplete,
  selectIsProcessingStarted,
} from 'src/modules/Process/store/selectors';
import { message, notification } from 'antd';
import React, { useState, useEffect } from 'react';
import { Button, Title, Modal } from '@cognite/cogs.js';
import { DetectionModelSelect } from 'src/modules/Process/Components/DetectionModelSelect';
import { isVideo } from 'src/modules/Common/Components/FileUploader/utils/FileUtils';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { getContainer } from 'src/utils';
import { AppDispatch } from 'src/store';
import { AutoMLAPI } from 'src/api/vision/autoML/AutoMLAPI';
import { AutoMLModelCore } from 'src/api/vision/autoML/types';
import { useFlag } from '@cognite/react-feature-flags';
import ProgressStatus from './ProgressStatus';

export const ProcessToolBar = () => {
  const visionAutoMLEnabled = useFlag('VISION_AutoML', {
    fallback: false,
    forceRerender: true,
  });
  const disabledModelTypes: VisionDetectionModelType[] = [];
  if (!visionAutoMLEnabled)
    disabledModelTypes.push(VisionDetectionModelType.CustomModel);

  const dispatch: AppDispatch = useDispatch();

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
  z-index: 1;
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
  max-width: 340px;
  min-width: 340px;
`;

const ModelOptions = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
`;

const ConfigurationModelFooter = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: flex-start;
`;
