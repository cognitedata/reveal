import { Spin } from 'antd';
import React, { ReactText, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ThumbnailCarousel } from 'src/modules/Review/Components/ThumbnailCarousel/ThumbnailCarousel';
import {
  selectAllReviewFiles,
  selectOtherAnnotationsForFile,
  selectTagAnnotationsForFile,
  selectVisibleNonRejectedAnnotationsForFile,
} from 'src/modules/Review/store/reviewSlice';
import { getParamLink, workflowRoutes } from 'src/utils/workflowRoutes';
import styled from 'styled-components';
import { DataExplorationProvider, Tabs } from '@cognite/data-exploration';
import { FileDetailsReview } from 'src/modules/FileDetails/Containers/FileDetailsReview/FileDetailsReview';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { QueryClient, QueryClientProvider } from 'react-query';
import { FileInfo, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { ImagePreview } from 'src/modules/Review/Containers/ImagePreview';
import { Title } from '@cognite/cogs.js';
import { ImageContextualization } from './ImageContextualization';

const queryClient = new QueryClient();

const ImageReview = (props: { file: FileInfo; prev: string | undefined }) => {
  const { file, prev } = props;
  const history = useHistory();
  const [inFocus, setInFocus] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const loadingState = useRef<boolean>(false);
  const [currentTab, tabChange] = useState('context');
  const contextElement = useRef<HTMLElement>(null);

  const reviewFiles = useSelector((state: RootState) =>
    selectAllReviewFiles(state)
  );

  const visibleNonRejectedAnnotations = useSelector((rootState: RootState) =>
    selectVisibleNonRejectedAnnotationsForFile(rootState, file.id)
  );

  const tagAnnotations = useSelector((rootState: RootState) =>
    selectTagAnnotationsForFile(rootState, file.id)
  );

  const otherAnnotations = useSelector((rootState: RootState) =>
    selectOtherAnnotationsForFile(rootState, file.id)
  );

  const onEditMode = (mode: boolean) => {
    setInFocus(mode);
  };

  const handleImageLoad = (status: boolean) => {
    setLoading(status);
    loadingState.current = status;
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
    if (contextElement.current) {
      const rowElement = contextElement.current.querySelector(
        `#annotation-table-row-${id}`
      );
      if (rowElement) {
        rowElement.scrollIntoView(true);
      }
    }
  };

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AnnotationContainer id="annotationContainer">
          <FilePreviewContainer>
            <PreviewContainer
              fullHeight={reviewFiles.length === 1}
              inFocus={inFocus}
            >
              {loading && (
                // eslint-disable-next-line @cognite/no-number-z-index
                <PreviewLoader style={{ zIndex: 1000 }}>
                  <Spin />
                </PreviewLoader>
              )}
              {file && (
                <ImagePreview
                  file={file}
                  onEditMode={onEditMode}
                  annotations={visibleNonRejectedAnnotations}
                  isLoading={handleImageLoad}
                  scrollIntoView={scrollToItem}
                />
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
                tab={currentTab}
                onTabChange={tabChange}
                style={{
                  border: 0,
                }}
              >
                <Tabs.Pane
                  title="Contextualization"
                  key="context"
                  style={{ overflow: 'hidden', height: `calc(100% - 45px)` }}
                >
                  <ImageContextualization
                    file={file}
                    reference={contextElement}
                    tagAnnotations={tagAnnotations}
                    otherAnnotations={otherAnnotations}
                  />
                </Tabs.Pane>
                <Tabs.Pane
                  title="File details"
                  key="file-detail"
                  style={{ overflow: 'hidden', height: `calc(100% - 45px)` }}
                >
                  {file && (
                    <DataExplorationProvider sdk={sdk}>
                      <QueryClientProvider client={queryClient}>
                        <FileDetailsReview fileObj={file} />
                      </QueryClientProvider>
                    </DataExplorationProvider>
                  )}
                </Tabs.Pane>
              </Tabs>
            </TabsContainer>
          </RightPanelContainer>
        </AnnotationContainer>
      </QueryClientProvider>
    </>
  );
};
export default ImageReview;

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

// eslint-disable-next-line @cognite/no-number-z-index
const PreviewLoader = styled.div`
  width: calc(100% - 50px);
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
