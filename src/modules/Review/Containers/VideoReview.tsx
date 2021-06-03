import React from 'react';
import styled from 'styled-components';
import { VideoPreview } from 'src/modules/Review/Components/VideoPreview/VideoPreview';
import { DataExplorationProvider, Tabs } from '@cognite/data-exploration';
import { Contextualization } from 'src/modules/Review/Containers/Contextualization';
import { FileDetailsReview } from 'src/modules/FileDetails/Containers/FileDetailsReview/FileDetailsReview';
import { QueryClient, QueryClientProvider } from 'react-query';
import { FileInfo, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { Title } from '@cognite/cogs.js';
import { VerticalCarousel } from '../Components/VerticalCarousel/VerticalCarousel';

const queryClient = new QueryClient();

const AnnotationsEdit = (props: { file: FileInfo }) => {
  const { file } = props;
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AnnotationContainer>
          <FilePreviewMetadataContainer>
            <FilePreviewContainer>
              <VerticalCarouselContainer id="verticalCarouselContainerVideo">
                <VerticalCarousel />
              </VerticalCarouselContainer>
              {file && <VideoPreview fileObj={file} />}
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
                    <Contextualization />
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
          </FilePreviewMetadataContainer>
        </AnnotationContainer>
      </QueryClientProvider>
    </>
  );
};
export default AnnotationsEdit;

const AnnotationContainer = styled.div`
  width: 100%;
  display: flex;
  height: 100%;
  box-sizing: border-box;
`;

const FilePreviewMetadataContainer = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: 70% auto;
  grid-template-rows: 100%;
  grid-column-gap: 30px;
`;

const FilePreviewContainer = styled.div`
  display: grid;
  grid-template-columns: 136px auto;
  grid-template-rows: 100%;
  grid-column-gap: 5px;
`;

const RightPanelContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const StyledTitle = styled(Title)`
  color: #4a67fb;
  padding-top: 17px;
  padding-bottom: 17px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 290px;
`;
const TabsContainer = styled.div`
  height: 100%;
  padding-right: 10px;
  border-radius: 8px;
`;

const VerticalCarouselContainer = styled.div`
  max-width: 136px;
  padding: 10px;
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
`;
