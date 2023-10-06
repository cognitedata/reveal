import React, { ReactText, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { Spin, notification } from 'antd';

import { Tabs, Title } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';

import { useThunkDispatch } from '../../../store';
import { RootState } from '../../../store/rootReducer';
import { getParamLink, workflowRoutes } from '../../../utils/workflowRoutes';
import { isVideo } from '../../Common/Components/FileUploader/utils/FileUtils';
import { FileDetailsReview } from '../../FileDetails/Containers/FileDetailsReview/FileDetailsReview';
import { PreviewProcessingOverlay } from '../Components/PreviewProcessingOverlay/PreviewProcessingOverlay';
import { ThumbnailCarousel } from '../Components/ThumbnailCarousel/ThumbnailCarousel';
import { VideoPreview } from '../Components/VideoPreview/VideoPreview';
import { selectAllReviewFiles } from '../store/review/selectors';
import { setScrollToId } from '../store/review/slice';

import { AnnotationDetailPanel } from './AnnotationDetailPanel/AnnotationDetailPanel';
import { FileProcessStatusWrapper } from './FileProcessStatusWrapper';
import { ImagePreview } from './ImagePreview';

const ReviewBody = (props: { file: FileInfo; prev: string | undefined }) => {
  const { file } = props;
  const navigate = useNavigate();
  const dispatch = useThunkDispatch();
  const [inFocus, setInFocus] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTab, tabChange] = useState('1');

  const reviewFiles = useSelector((state: RootState) =>
    selectAllReviewFiles(state)
  );

  const onEditMode = useCallback(
    (mode: boolean) => {
      setInFocus(mode);
    },
    [setInFocus]
  );

  const handleLoad = useCallback((status: boolean) => {
    setLoading(status);
  }, []);

  const handleError = ({
    message,
    description,
  }: {
    message: string;
    description: string;
  }) => {
    notification.error({ message, description });
  };

  const onItemClick = (fileId: number) => {
    if (fileId !== file.id) {
      setLoading(true);

      // Go to this file
      navigate(getParamLink(workflowRoutes.review, ':fileId', String(fileId)), {
        replace: true,
      });
    }
  };

  // remove loading icon if handle load was not called due to error
  useEffect(() => {
    if (loading) {
      // timeout loading spinner
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }
  }, [loading]);

  const scrollToItem = useCallback(
    (id: ReactText) => {
      tabChange('1');
      dispatch(setScrollToId(id.toString()));
    },
    [tabChange, dispatch, setScrollToId]
  );

  return (
    <AnnotationContainer id="annotationContainer">
      <FilePreviewContainer>
        <PreviewContainer
          fullHeight={reviewFiles.length === 1}
          inFocus={inFocus}
        >
          {loading && (
            <PreviewLoader style={{ zIndex: 1000 }} isVideo={isVideo(file)}>
              <Spin />
            </PreviewLoader>
          )}
          {file && isVideo(file) ? (
            <VideoPreview
              fileObj={file}
              isLoading={handleLoad}
              onError={handleError}
            />
          ) : (
            <FileProcessStatusWrapper fileId={file.id}>
              {({ isFileProcessing }) => {
                return (
                  // Disabling all the mouse events inside this wrapper when the file is processing using css
                  <PreviewWrapper isFileProcessing={isFileProcessing}>
                    <ImagePreview
                      file={file}
                      onEditMode={onEditMode}
                      isLoading={handleLoad}
                      scrollIntoView={scrollToItem}
                    />
                    {isFileProcessing && <PreviewProcessingOverlay />}
                  </PreviewWrapper>
                );
              }}
            </FileProcessStatusWrapper>
          )}
        </PreviewContainer>
        {reviewFiles.length > 1 && (
          <ThumbnailCarousel files={reviewFiles} onItemClick={onItemClick} />
        )}
      </FilePreviewContainer>
      <RightPanelContainer>
        <StyledTitle level={4}>{file?.name}</StyledTitle>
        <TabsContainer>
          <Tabs
            defaultActiveKey={isVideo(file) ? '2' : currentTab}
            onTabClick={tabChange}
          >
            <Tabs.Tab label="Annotations" tabKey="1" disabled={isVideo(file)}>
              <FileDetailsContent>
                <AnnotationDetailPanel file={file} showEditOptions />
              </FileDetailsContent>
            </Tabs.Tab>
            <Tabs.Tab label="File details" tabKey="2">
              {file && (
                <FileDetailsContent>
                  <FileDetailsReview fileObj={file} />
                </FileDetailsContent>
              )}
            </Tabs.Tab>
          </Tabs>
        </TabsContainer>
      </RightPanelContainer>
      <div aria-hidden="true" className="confirm-delete-modal-anchor" />
    </AnnotationContainer>
  );
};
export default ReviewBody;

const AnnotationContainer = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: auto minmax(400px, 25%);
  grid-template-rows: 100%;
`;

const FilePreviewContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
type PreviewProps = {
  fullHeight: boolean;
  inFocus?: boolean;
};

interface PreviewLoaderProps {
  isVideo: boolean;
}
const PreviewLoader = styled.div<PreviewLoaderProps>`
  width: ${(props) => (props.isVideo ? '100%' : 'calc(100% - 50px)')};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.15),
    inset -3px 0 5px rgba(0, 0, 0, 0.15), inset 3px 0 5px rgba(0, 0, 0, 0.15);
  position: absolute;
  background-color: white;
  right: 0;
`;
const PreviewContainer = styled.div<PreviewProps>`
  max-height: ${(props) => (props.fullHeight ? '100%' : 'calc(100% - 120px)')};
  height: ${(props) => (props.fullHeight ? '100%' : 'calc(100% - 120px)')};
  outline: ${(props) => (props.inFocus ? '3px solid #4A67FB' : 'none')};
  position: relative;
`;

const RightPanelContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 15px;
  display: grid;
  grid-template-rows: 36px 1fr;
  grid-template-columns: 100%;
`;

const StyledTitle = styled(Title)`
  color: #4a67fb;
  padding-bottom: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const TabsContainer = styled.div`
  height: 100%;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-sizing: content-box;
`;

const PreviewWrapper = styled.div<{ isFileProcessing: boolean }>`
  height: 100%;
  width: 100%;
  pointer-events: ${(props) => (props.isFileProcessing ? 'none' : 'all')};
`;

const FileDetailsContent = styled.div`
  height: calc(100vh - 210px);
  width: 100%;
  padding-right: 10px;
  padding-left: 2px;
  padding-bottom: 10px;
  overflow-y: auto;
`;
