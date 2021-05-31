import React, { useEffect } from 'react';
import styled from 'styled-components';
import { DataExplorationProvider, Tabs } from '@cognite/data-exploration';
import {
  Contextualization,
  EditContextualization,
} from 'src/modules/Review/Containers/Contextualization';
import { FileDetailsReview } from 'src/modules/FileDetails/Containers/FileDetailsReview/FileDetailsReview';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { selectAnnotationsByFileIdModelTypes } from 'src/modules/Review/previewSlice';
import { getLink, workflowRoutes } from 'src/modules/Workflow/workflowRoutes';
import { QueryClient, QueryClientProvider } from 'react-query';
import { FileInfo, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { ImagePreviewEditMode } from 'src/constants/enums/ImagePreviewEditMode';
import { VisionAPIType } from 'src/api/types';
import { PopulateAnnotations } from 'src/store/thunks/PopulateAnnotations';
import { ImagePreviewContainer } from 'src/modules/Review/Containers/ImagePreviewContainer';
import { VerticalCarousel } from '../Components/VerticalCarousel/VerticalCarousel';

const queryClient = new QueryClient();

const ImageReview = (props: {
  fileId: string;
  drawerMode: number | null;
  file: FileInfo;
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { fileId, drawerMode, file } = props;

  useEffect(() => {
    if (file) {
      dispatch(
        PopulateAnnotations({
          fileId: file.id.toString(),
          assetIds: file.assetIds,
        })
      );
    }
  }, []);

  if (!file) {
    // navigate to upload step if file is not available(if the user uses a direct link)
    history.push(getLink(workflowRoutes.upload));
    return null;
  }

  const tagAnnotations = useSelector(({ previewSlice }: RootState) =>
    selectAnnotationsByFileIdModelTypes(previewSlice, fileId, [
      VisionAPIType.TagDetection,
    ])
  );

  const gdprAndTextAndObjectAnnotations = useSelector(
    ({ previewSlice }: RootState) =>
      selectAnnotationsByFileIdModelTypes(previewSlice, fileId, [
        VisionAPIType.OCR,
        VisionAPIType.ObjectDetection,
      ])
  );
  const editMode = useSelector(
    (state: RootState) =>
      state.previewSlice.imagePreview.editable ===
      ImagePreviewEditMode.Modifiable
  );

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AnnotationContainer id="annotationContainer">
          <FilePreviewMetadataContainer>
            <FilePreviewContainer>
              <VerticalCarouselContainer id="verticalCarouselContainer">
                <VerticalCarousel />
              </VerticalCarouselContainer>
              <EditContextualization
                editMode={editMode}
                tagAnnotations={tagAnnotations}
                gdprAndTextAndObjectAnnotations={
                  gdprAndTextAndObjectAnnotations
                }
              />
              {file && (
                <ImagePreviewContainer file={file} drawerMode={drawerMode} />
              )}
            </FilePreviewContainer>
            <TabsContainer className="z-8">
              <Tabs
                tab="context"
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
                >
                  <Contextualization
                    file={file}
                    tagAnnotations={tagAnnotations}
                    gdprAndTextAndObjectAnnotations={
                      gdprAndTextAndObjectAnnotations
                    }
                  />
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
export default ImageReview;

const AnnotationContainer = styled.div`
  width: 100%;
  padding: 20px 0 0;
  display: flex;
  height: 100%;
  box-sizing: border-box;
`;

const VerticalCarouselContainer = styled.div`
  max-width: 136px;
  padding: 10px;
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
`;

const FilePreviewMetadataContainer = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: auto 40%;
  grid-template-rows: 100%;
  grid-column-gap: 30px;
`;

const FilePreviewContainer = styled.div`
  display: flex;
  height: 100%;
`;

const TabsContainer = styled.div`
  height: 100%;
  padding: 30px 45px 0;
  border-radius: 8px;
`;
