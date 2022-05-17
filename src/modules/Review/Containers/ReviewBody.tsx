import { FileInfo } from '@cognite/sdk';
import sdk, { getFlow } from '@cognite/cdf-sdk-singleton';
import { Title } from '@cognite/cogs.js';
import { DataExplorationProvider, Tabs } from '@cognite/data-exploration';
import { Spin, notification } from 'antd';
import React, { ReactText, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { FileDetailsReview } from 'src/modules/FileDetails/Containers/FileDetailsReview/FileDetailsReview';
import { ThumbnailCarousel } from 'src/modules/Review/Components/ThumbnailCarousel/ThumbnailCarousel';
import { ImagePreview } from 'src/modules/Review/Containers/ImagePreview';
import { ImageKeyboardShortKeys } from 'src/modules/Review/Containers/KeyboardShortKeys/ImageKeyboardShortKeys';
import {
  selectAllReviewFiles,
  setScrollToId,
} from 'src/modules/Review/store/reviewSlice';
import { RootState } from 'src/store/rootReducer';
import { getParamLink, workflowRoutes } from 'src/utils/workflowRoutes';
import styled from 'styled-components';
import { VideoPreview } from 'src/modules/Review/Components/VideoPreview/VideoPreview';
import { isVideo } from 'src/modules/Common/Components/FileUploader/utils/FileUtils';
import { useUserInformation } from 'src/hooks/useUserInformation';
import { FileProcessStatusWrapper } from 'src/modules/Review/Containers/FileProcessStatusWrapper';
import { PreviewProcessingOverlay } from 'src/modules/Review/Components/PreviewProcessingOverlay/PreviewProcessingOverlay';
import { AnnotationDetailPanel } from './AnnotationDetailPanel/AnnotationDetailPanel';

const queryClient = new QueryClient();

const ReviewBody = (props: { file: FileInfo; prev: string | undefined }) => {
  const { file, prev } = props;
  const history = useHistory();
  const dispatch = useDispatch();
  const [inFocus, setInFocus] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const loadingState = useRef<boolean>(false);
  const [currentTab, tabChange] = useState('context');
  const contextElement = useRef<HTMLElement>(null);

  const { flow } = getFlow();
  const { data: userInfo } = useUserInformation();

  const reviewFiles = useSelector((state: RootState) =>
    selectAllReviewFiles(state)
  );

  const onEditMode = (mode: boolean) => {
    setInFocus(mode);
  };

  const handleLoad = (status: boolean) => {
    setLoading(status);
    loadingState.current = status;
  };

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
      loadingState.current = true;

      // Go to this file
      history.replace(
        getParamLink(workflowRoutes.review, ':fileId', String(fileId)),
        { from: prev }
      );
    }
  };

  useEffect(() => {
    if (loading && loadingState.current) {
      // timeout loading spinner
      setTimeout(() => {
        if (loadingState.current) {
          setLoading(false);
        }
      }, 10000);
    }
  }, [loading]);

  const scrollToItem = (id: ReactText) => {
    tabChange('context');
    dispatch(setScrollToId(id.toString()));
  };

  return (
    <ImageKeyboardShortKeys>
      <QueryClientProvider client={queryClient}>
        <AnnotationContainer id="annotationContainer">
          <FilePreviewContainer>
            <PreviewContainer
              fullHeight={reviewFiles.length === 1}
              inFocus={inFocus}
            >
              {loading && (
                // eslint-disable-next-line @cognite/no-number-z-index
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
                      <>
                        <ImagePreview
                          file={file}
                          onEditMode={onEditMode}
                          isLoading={handleLoad}
                          scrollIntoView={scrollToItem}
                        />
                        {isFileProcessing && <PreviewProcessingOverlay />}
                      </>
                    );
                  }}
                </FileProcessStatusWrapper>
              )}
            </PreviewContainer>
            {reviewFiles.length > 1 && (
              <ThumbnailCarousel
                files={reviewFiles}
                onItemClick={onItemClick}
              />
            )}
          </FilePreviewContainer>
          <RightPanelContainer>
            <StyledTitle level={4}>{file?.name}</StyledTitle>
            <TabsContainer>
              <Tabs
                tab={isVideo(file) ? 'file-detail' : currentTab}
                onTabChange={tabChange}
                style={{
                  border: 0,
                }}
              >
                <Tabs.Pane
                  title="Annotations"
                  key="context"
                  style={{ overflow: 'hidden', height: `calc(100% - 45px)` }}
                  disabled={isVideo(file)}
                >
                  <AnnotationDetailPanel
                    file={file}
                    reference={contextElement}
                  />
                </Tabs.Pane>
                <Tabs.Pane
                  title="File details"
                  key="file-detail"
                  style={{ overflow: 'hidden', height: `calc(100% - 45px)` }}
                >
                  {file && (
                    <DataExplorationProvider
                      flow={flow}
                      sdk={sdk}
                      userInfo={userInfo}
                      overrideURLMap={{
                        pdfjsWorkerSrc:
                          '/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.min.js',
                      }}
                    >
                      <QueryClientProvider client={queryClient}>
                        <FileDetailsReview fileObj={file} />
                      </QueryClientProvider>
                    </DataExplorationProvider>
                  )}
                </Tabs.Pane>
              </Tabs>
            </TabsContainer>
          </RightPanelContainer>
          <div aria-hidden="true" className="confirm-delete-modal-anchor" />
        </AnnotationContainer>
      </QueryClientProvider>
    </ImageKeyboardShortKeys>
  );
};
export default ReviewBody;

const AnnotationContainer = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: auto minmax(520px, 32%);
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
// eslint-disable-next-line @cognite/no-number-z-index
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
  padding: 17px;
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
