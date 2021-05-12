import React from 'react';
import styled from 'styled-components';
import { ImagePreview } from 'src/modules/Preview/Components/ImagePreview/ImagePreview';
import { DataExplorationProvider, Tabs } from '@cognite/data-exploration';
import { Contextualization } from 'src/modules/Preview/Containers/Contextualization';
import { FileDetailsReview } from 'src/modules/FileDetails/Containers/FileDetailsReview/FileDetailsReview';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  addPolygon,
  selectVisibleNonRejectAndEditModeAnnotations,
  updateAnnotationBoundingBox,
  VisibleAnnotations,
} from 'src/modules/Preview/previewSlice';
import { getLink, workflowRoutes } from 'src/modules/Workflow/workflowRoutes';
import { QueryClient, QueryClientProvider } from 'react-query';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { selectFileById } from 'src/modules/Common/filesSlice';
import { ImagePreviewEditMode } from 'src/constants/enums/ImagePreviewEditMode';
import { ProposedCogniteAnnotation } from '@cognite/react-picture-annotation';
import { AnnotationDrawerMode } from 'src/utils/AnnotationUtils';
import { VisionAPIType } from 'src/api/types';

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
  grid-template-columns: 65% auto;
  grid-template-rows: 100%;
  grid-column-gap: 30px;
`;

const FilePreviewContainer = styled.div`
  height: 100%;
`;

const TabsContainer = styled.div`
  height: 100%;
  padding: 30px 45px 0;
  border-radius: 8px;
`;

const queryClient = new QueryClient();

const ImageReview = (props: { fileId: string; drawerMode: number | null }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { fileId, drawerMode } = props;

  const file = useSelector(({ filesSlice }: RootState) =>
    selectFileById(filesSlice, fileId)
  );

  const visibleNonRejectedAnnotationsAndEditModeAnnotation = useSelector(
    ({ previewSlice }: RootState) =>
      selectVisibleNonRejectAndEditModeAnnotations(
        previewSlice,
        fileId
      ) as VisibleAnnotations[]
  );

  const [
    imagePreviewEditable,
    imagePreviewCreatable,
  ] = useSelector((state: RootState) => [
    state.previewSlice.imagePreview.editable ===
      ImagePreviewEditMode.Modifiable,
    state.previewSlice.imagePreview.editable === ImagePreviewEditMode.Creatable,
  ]);

  if (!file) {
    // navigate to upload step if file is not available(if the user uses a direct link)
    history.push(getLink(workflowRoutes.upload));
    return null;
  }

  const handleCreateAnnotation = (annotation: ProposedCogniteAnnotation) => {
    if (imagePreviewCreatable) {
      if (drawerMode === AnnotationDrawerMode.AddAnnotation) {
        dispatch(
          addPolygon({
            fileId,
            box: annotation.box,
            modelType: VisionAPIType.ObjectDetection, // TODO: should depend on model type
          })
        );
      }
      if (drawerMode === AnnotationDrawerMode.LinkAsset) {
        dispatch(
          addPolygon({
            fileId,
            box: annotation.box,
            modelType: VisionAPIType.TagDetection,
          })
        );
      }
    }
  };

  const handleModifyAnnotation = (annotation: any) => {
    if (imagePreviewEditable) {
      dispatch(
        updateAnnotationBoundingBox({
          id: annotation.id,
          boundingBox: annotation.box,
        })
      );
    }
  };

  return (
    <>
      <AnnotationContainer>
        <FilePreviewMetadataContainer>
          <FilePreviewContainer>
            {file && (
              <ImagePreview
                fileObj={file}
                annotations={visibleNonRejectedAnnotationsAndEditModeAnnotation}
                editable={imagePreviewEditable}
                creatable={imagePreviewCreatable}
                onCreateAnnotation={handleCreateAnnotation}
                onUpdateAnnotation={handleModifyAnnotation}
              />
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
                <Contextualization fileId={fileId} />
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
    </>
  );
};
export default ImageReview;
