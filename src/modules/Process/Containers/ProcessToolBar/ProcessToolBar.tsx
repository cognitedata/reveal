/* eslint-disable @typescript-eslint/no-unused-vars */
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  detectAnnotations,
  selectIsPollingComplete,
  setProcessViewFileUploadModalVisibility,
  setSelectedDetectionModels,
  setSelectFromExploreModalVisibility,
} from 'src/modules/Process/processSlice';
import { message, notification } from 'antd';
import { toastProps } from 'src/utils/ToastUtils';
import React, { useEffect, useState } from 'react';
import { Button, Title, Modal } from '@cognite/cogs.js';
import { DetectionModelSelect } from 'src/modules/Process/Components/DetectionModelSelect';
import { isVideo } from 'src/modules/Common/Components/FileUploader/utils/FileUtils';
import {
  addFiles,
  addUploadedFile,
  selectAllFiles,
} from 'src/modules/Common/filesSlice';
import { VisionAPIType } from 'src/api/types';
import { getContainer } from 'src/utils';
import { FileUploadModal } from 'src/modules/Common/Components/FileUploaderModal/FileUploaderModal';
import { ExploreModal } from 'src/modules/Common/Components/ExploreModal/ExploreModal';
import { TableDataItem } from 'src/modules/Common/types';
import { FileFilterProps, FileInfo } from '@cognite/cdf-sdk-singleton';
import {
  selectExplorerAllSelectedFiles,
  selectExplorerSelectedFileIds,
  setExplorerFileSelectState,
  setExplorerFilter,
  setExplorerQueryString,
  setExplorerSelectedFileId,
} from 'src/modules/Explorer/store/explorerSlice';
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
  const fileUploadActive = !files.length;
  const modelSelectorActive =
    !!files.length && !selectedDetectionModels.length && isPollingFinished;

  // ExploreModal
  const showSelectFromExploreModal = useSelector(
    ({ processSlice }: RootState) => processSlice.showExploreModal
  );
  const exploreModalClickedFileId = useSelector(
    (state: RootState) => state.explorerReducer.selectedFileId
  );
  const exploreModalSearchQuery = useSelector(
    (state: RootState) => state.explorerReducer.query
  );
  const filter = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.filter
  );
  const selectedExploreModalFiles: FileInfo[] = useSelector(
    (state: RootState) => {
      return selectExplorerAllSelectedFiles(state.explorerReducer);
    }
  );
  const selectedFileIds = useSelector((state: RootState) =>
    selectExplorerSelectedFileIds(state.explorerReducer)
  );
  const handleExploreSearchChange = (text: string) => {
    dispatch(setExplorerQueryString(text));
  };
  const handleExplorerModalItemClick = ({
    menu,
    selected,
    ...file
  }: TableDataItem) => {
    dispatch(setExplorerSelectedFileId(file.id));
  };
  const handleExploreModalRowSelect = (
    item: TableDataItem,
    selected: boolean
  ) => {
    dispatch(setExplorerFileSelectState(item.id, selected));
  };
  const setFilter = (newFilter: FileFilterProps) => {
    dispatch(setExplorerFilter(newFilter));
  };
  const handleUseFiles = () => {
    dispatch(addFiles(selectedExploreModalFiles));
    dispatch(setSelectFromExploreModalVisibility(false));
  };

  useEffect(() => {
    if (isPollingFinished || showDrawer) {
      notification.close('inProgressToast');
    } else {
      notification.info({
        ...toastProps,
        duration: 0,
      });
    }
  }, [isPollingFinished, showDrawer]);

  return (
    <>
      <FileUploadModal
        onUploadSuccess={onUploadSuccess}
        showModal={showFileUploadModal}
        onCancel={() =>
          dispatch(setProcessViewFileUploadModalVisibility(false))
        }
      />
      <ExploreModal
        showModal={showSelectFromExploreModal}
        selectedId={exploreModalClickedFileId}
        query={exploreModalSearchQuery}
        filter={filter}
        selectedCount={selectedFileIds.length}
        setFilter={setFilter}
        onSearch={handleExploreSearchChange}
        onItemClick={handleExplorerModalItemClick}
        onRowSelect={handleExploreModalRowSelect}
        onCloseModal={() =>
          dispatch(setSelectFromExploreModalVisibility(false))
        }
        onUseFiles={handleUseFiles}
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
                icon="AddToList"
                disabled={disableAddFiles}
                style={{ marginLeft: 8 }}
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
                    isDisabled={disableModelSelection}
                  />
                </ModelSelector>
                <Button
                  type="primary"
                  disabled={!isPollingFinished}
                  onClick={onDetectClick}
                >
                  Detect
                </Button>
              </ModelOptions>
            </ElementContent>
          </ProcessToolBarElement>
        </ToolContainer>
      </Container>
    </>
  );
};
const Container = styled.div`
  display: grid;
  width: 100%;
  padding-top: 20px;
  padding-bottom: 15px;
  grid-gap: 25px;
  grid-template-columns: max-content auto;
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
