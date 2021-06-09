import React, { useState } from 'react';
import styled from 'styled-components';
import { DataExplorationProvider, Tabs } from '@cognite/data-exploration';
import {
  Contextualization,
  EditContextualization,
} from 'src/modules/Review/Containers/Contextualization';
import { FileDetailsReview } from 'src/modules/FileDetails/Containers/FileDetailsReview/FileDetailsReview';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { selectAnnotationsByFileIdModelTypes } from 'src/modules/Review/previewSlice';
import { QueryClient, QueryClientProvider } from 'react-query';
import { FileInfo, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { ImagePreviewEditMode } from 'src/constants/enums/VisionEnums';
import { VisionAPIType } from 'src/api/types';
import { ImagePreviewContainer } from 'src/modules/Review/Containers/ImagePreviewContainer';
import { Title } from '@cognite/cogs.js';
import { CreateAnnotations } from 'src/store/thunks/CreateAnnotations';
import { AnnotationDrawerMode } from 'src/utils/AnnotationUtils';
import { VerticalCarousel } from '../Components/VerticalCarousel/VerticalCarousel';

const queryClient = new QueryClient();

const ImageReview = (props: { drawerMode: number | null; file: FileInfo }) => {
  const [previewInFocus, setPreviewInFocus] = useState<boolean>(false);
  const { drawerMode, file } = props;
  const dispatch = useDispatch();
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
  const editMode = useSelector(
    (state: RootState) =>
      state.previewSlice.imagePreview.editable ===
      ImagePreviewEditMode.Modifiable
  );

  const handleAddToFile = () => {
    if (drawerMode === AnnotationDrawerMode.AddAnnotation) {
      dispatch(CreateAnnotations({ fileId: file!.id, type: drawerMode }));
    }
  };

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
                handleAddToFile={handleAddToFile}
                handleInEditMode={setPreviewInFocus}
              />
              {file && (
                <ImagePreviewContainer
                  file={file}
                  drawerMode={drawerMode}
                  inFocus={previewInFocus}
                />
              )}
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
