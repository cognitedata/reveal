import React from 'react';
import styled from 'styled-components';
import { VideoPreview } from 'src/modules/Review/Components/VideoPreview/VideoPreview';
import { DataExplorationProvider, Tabs } from '@cognite/data-exploration';
import { Contextualization } from 'src/modules/Review/Containers/Contextualization';
import { FileDetailsReview } from 'src/modules/FileDetails/Containers/FileDetailsReview/FileDetailsReview';
import { QueryClient, QueryClientProvider } from 'react-query';
import { FileInfo, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
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
            <TabsContainer className="z-8">
              <Tabs
                tab="file-detail"
                onTabChange={() => {}}
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: '20px',
                }}
              >
                <Tabs.Pane
                  title="Contextualization"
                  key="context"
                  style={{ overflow: 'hidden', height: `calc(100% - 45px)` }}
                  disabled
                >
                  <Contextualization file={file} />
                </Tabs.Pane>
                <Tabs.Pane
                  title="File Details"
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
          </FilePreviewMetadataContainer>
        </AnnotationContainer>
      </QueryClientProvider>
    </>
  );
};
export default AnnotationsEdit;

const AnnotationContainer = styled.div`
  width: 100%;
  padding: 20px 0 0;
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

const TabsContainer = styled.div`
  height: 100%;
  padding: 30px 45px 0;
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
