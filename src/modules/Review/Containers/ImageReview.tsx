import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider, Tabs } from '@cognite/data-exploration';
import { Contextualization } from 'src/modules/Review/Containers/Contextualization';
import { FileDetailsReview } from 'src/modules/FileDetails/Containers/FileDetailsReview/FileDetailsReview';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { selectAnnotationsByFileIdModelTypes } from 'src/modules/Review/previewSlice';
import { QueryClient, QueryClientProvider } from 'react-query';
import { FileInfo, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { VisionAPIType } from 'src/api/types';
import { ImagePreviewContainer } from 'src/modules/Review/Containers/ImagePreviewContainer';
import { Title } from '@cognite/cogs.js';
import { VerticalCarousel } from '../Components/VerticalCarousel/VerticalCarousel';

const queryClient = new QueryClient();

const ImageReview = (props: { file: FileInfo; prev: string | undefined }) => {
  const { file, prev } = props;
  const tagAnnotations = useSelector(({ previewSlice }: RootState) =>
    selectAnnotationsByFileIdModelTypes(previewSlice, String(file.id), [
      VisionAPIType.TagDetection,
    ])
  );

  const gdprAndTextAndObjectAnnotations = useSelector(
    ({ previewSlice }: RootState) =>
      selectAnnotationsByFileIdModelTypes(previewSlice, String(file.id), [
        VisionAPIType.OCR,
        VisionAPIType.ObjectDetection,
      ])
  );

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AnnotationContainer id="annotationContainer">
          <FilePreviewMetadataContainer>
            <FilePreviewContainer>
              <VerticalCarousel prev={prev} />
              {file && <ImagePreviewContainer file={file} />}
            </FilePreviewContainer>
            <RightPanelContainer>
              <StyledTitle level={4}>{file?.name}</StyledTitle>
              <TabsContainer>
                <Tabs
                  tab="context"
                  onTabChange={() => {}}
                  style={{
                    border: 0,
                  }}
                >
                  <Tabs.Pane
                    title="Contextualization"
                    key="context"
                    style={{ overflow: 'hidden', height: `calc(100% - 45px)` }}
                  >
                    <Contextualization
                      tagAnnotations={tagAnnotations}
                      gdprAndTextAndObjectAnnotations={
                        gdprAndTextAndObjectAnnotations
                      }
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
          </FilePreviewMetadataContainer>
        </AnnotationContainer>
      </QueryClientProvider>
    </>
  );
};
export default ImageReview;

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
  grid-template-columns: auto 32%;
  grid-template-rows: 100%;
  grid-column-gap: 17px;
`;

const FilePreviewContainer = styled.div`
  display: flex;
  height: 100%;
  position: relative;
`;

const RightPanelContainer = styled.div`
  width: 100%;
  height: 90%;
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
