import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  detectAnnotations,
  selectIsPollingComplete,
  setProcessViewFileUploadModalVisibility,
  setSelectedDetectionModels,
} from 'src/modules/Process/processSlice';
import { message, notification } from 'antd';
import { toastProps } from 'src/utils/ToastUtils';
import React, { useState } from 'react';
import { Button, Title, Modal } from '@cognite/cogs.js';
import { DetectionModelSelect } from 'src/modules/Process/Components/DetectionModelSelect';
import { isVideo } from 'src/modules/Common/Components/FileUploader/utils/FileUtils';
import { addUploadedFile, selectAllFiles } from 'src/modules/Common/filesSlice';
import { VisionAPIType } from 'src/api/types';
import { getContainer } from 'src/utils';
import { FileUploadModal } from 'src/modules/Common/Components/FileUploaderModal/FileUploaderModal';
import { ModelConfiguration } from '../ModelConfiguration';

export const ProcessToolBar = () => {
  const dispatch = useDispatch();

  const files = useSelector((state: RootState) =>
    selectAllFiles(state.filesSlice)
  );

  const isPollingFinished = useSelector((state: RootState) => {
    return selectIsPollingComplete(state.processSlice);
  });

  const showDrawer = useSelector(
    (state: RootState) => state.processSlice.showFileMetadataDrawer
  );

  const selectedDetectionModels = useSelector(
    (state: RootState) => state.processSlice.selectedDetectionModels
  );

  const showFileUploadModal = useSelector(
    ({ processSlice }: RootState) => processSlice.showFileUploadModal
  );

  const onDetectClick = () => {
    if (!selectedDetectionModels.length) {
      message.error('Please select ML models to use for detection');
      return;
    }

    if (files.filter((file) => isVideo(file)).length) {
      notification.warning({
        message: 'Skipping video files',
        description:
          'Automatic contextualization is currently not supported for videos.',
      });
    }
    dispatch(
      detectAnnotations({
        fileIds: files.filter((file) => !isVideo(file)).map(({ id }) => id),
        detectionModels: selectedDetectionModels,
      })
    );
  };

  const onChange = (models: Array<VisionAPIType>) => {
    dispatch(setSelectedDetectionModels(models));
  };

  const [isModalOpen, setModalOpen] = useState(false);
  const onUploadSuccess = React.useCallback(
    (file) => {
      dispatch(addUploadedFile(file));
    },
    [dispatch]
  );

  const disableAddFiles = !isPollingFinished;
  const disableModelSelection = !files.length || !isPollingFinished;

  return (
    <>
      <FileUploadModal
        initialUploadedFiles={files}
        onUploadSuccess={onUploadSuccess}
        showModal={showFileUploadModal}
        onCancel={() =>
          dispatch(setProcessViewFileUploadModalVisibility(false))
        }
      />

      <Container>
        <Modal
          getContainer={getContainer}
          footer={null}
          visible={isModalOpen}
          width={900}
          closable={false}
          onCancel={() => {
            setModalOpen(false);
          }}
          style={{ background: '#fafafa', borderRadius: '10px' }}
        >
          <ModelConfiguration />
        </Modal>
        <FilesToolContainer disabled={disableAddFiles}>
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
              icon="AddToList"
              disabled
              style={{ marginLeft: 8 }}
            >
              Select from files
            </Button>
          </ElementContent>
        </FilesToolContainer>
        <MLModelSelectContainer disabled={disableModelSelection}>
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
                  disabled={disableModelSelection}
                />
              </ModelSelector>
              <Button
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
          </ElementContent>
        </MLModelSelectContainer>
        {isPollingFinished || showDrawer
          ? notification.info({
              ...toastProps,
              duration: 0.01,
              style: { ...toastProps.style, visibility: 'collapse' },
            })
          : notification.info({
              ...toastProps,
              duration: 0,
            })}
      </Container>
    </>
  );
};
const Container = styled.div`
  display: flex;
  width: 100%;
  padding-top: 20px;
  padding-bottom: 15px;
`;

type ToolBarElemProps = {
  disabled: boolean;
};
const ProcessToolBarElement = styled.div<ToolBarElemProps>`
  padding: 10px;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
`;
const FilesToolContainer = styled(ProcessToolBarElement)`
  background: #fafafa;
  border: 0.5px solid #dcdcdc;
  box-sizing: border-box;
  border-radius: 10px;
`;
const MLModelSelectContainer = styled(ProcessToolBarElement)`
  background: rgba(74, 103, 251, 0.1);
  border: 0.5px solid #4a67fb;
  box-sizing: border-box;
  border-radius: 10px;
  margin-left: 25px;
`;
const ElementTitle = styled.div`
  display: flex;
  width: 100%;
  box-sizing: content-box;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;
const ElementContent = styled.div``;

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
