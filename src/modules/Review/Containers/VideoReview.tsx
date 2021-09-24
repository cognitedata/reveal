import React from 'react';
import { ThumbnailCarousel } from 'src/modules/Review/Components/ThumbnailCarousel/ThumbnailCarousel';
import { VideoContextualization } from 'src/modules/Review/Containers/VideoContextualization';
import { selectAllReviewFiles } from 'src/modules/Review/store/reviewSlice';
import styled from 'styled-components';
import { VideoPreview } from 'src/modules/Review/Components/VideoPreview/VideoPreview';
import { DataExplorationProvider, Tabs } from '@cognite/data-exploration';
import { FileDetailsReview } from 'src/modules/FileDetails/Containers/FileDetailsReview/FileDetailsReview';
import { QueryClient, QueryClientProvider } from 'react-query';
import { FileInfo, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { Title } from '@cognite/cogs.js';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';

const queryClient = new QueryClient();

const VideoReview = (props: { file: FileInfo; prev: string | undefined }) => {
  const { file, prev } = props;

  const reviewFiles = useSelector((state: RootState) =>
    selectAllReviewFiles(state)
  );

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AnnotationContainer>
          <FilePreviewContainer>
            <PreviewContainer
              fullHeight={reviewFiles.length === 1}
              inFocus={false}
            >
              {file && <VideoPreview fileObj={file} />}
            </PreviewContainer>
            {reviewFiles.length > 1 && (
              <ThumbnailCarousel prev={prev} files={reviewFiles} />
            )}
          </FilePreviewContainer>
          <RightPanelContainer>
            <StyledTitle level={4}>{file?.name}</StyledTitle>
            <TabsContainer>
              <Tabs
                tab="file-detail"
                onTabChange={() => {}}
                style={{
                  border: 0,
                }}
              >
                <Tabs.Pane
                  title="Contextualization"
                  key="context"
                  style={{ overflow: 'hidden', height: `calc(100% - 45px)` }}
                  disabled
                >
                  <VideoContextualization file={file} />
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
export default VideoReview;

const AnnotationContainer = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: 68% 32%;
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
  inFocus: boolean;
};
const PreviewContainer = styled.div<PreviewProps>`
  max-height: ${(props) => (props.fullHeight ? '100%' : 'calc(100% - 120px)')};
  height: ${(props) => (props.fullHeight ? '100%' : 'calc(100% - 120px)')};
  background: grey;
  outline: ${(props) => (props.inFocus ? '3px solid #4A67FB' : 'none')};
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
