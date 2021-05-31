import { ImagePreview } from 'src/modules/Review/Components/ImagePreview/ImagePreview';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  addPolygon,
  selectVisibleNonRejectAndEditModeAnnotations,
  updateAnnotationBoundingBox,
  VisibleAnnotations,
} from 'src/modules/Review/previewSlice';
import { ImagePreviewEditMode } from 'src/constants/enums/ImagePreviewEditMode';
import { ProposedCogniteAnnotation } from '@cognite/react-picture-annotation';
import { AnnotationDrawerMode } from 'src/utils/AnnotationUtils';
import { VisionAPIType } from 'src/api/types';
import { UpdateAnnotationsById } from 'src/store/thunks/UpdateAnnotationsById';
import { FileInfo } from '@cognite/cdf-sdk-singleton';

export const ImagePreviewContainer = ({
  drawerMode,
  file,
}: {
  file: FileInfo;
  drawerMode: number | null;
}) => {
  const dispatch = useDispatch();
  const visibleNonRejectedAnnotationsAndEditModeAnnotation = useSelector(
    ({ previewSlice }: RootState) =>
      selectVisibleNonRejectAndEditModeAnnotations(
        previewSlice,
        String(file.id)
      ) as VisibleAnnotations[]
  );

  const [imagePreviewEditable, imagePreviewCreatable] = useSelector(
    (state: RootState) => [
      state.previewSlice.imagePreview.editable ===
        ImagePreviewEditMode.Modifiable,
      state.previewSlice.imagePreview.editable ===
        ImagePreviewEditMode.Creatable,
    ]
  );

  const handleCreateAnnotation = (annotation: ProposedCogniteAnnotation) => {
    if (imagePreviewCreatable) {
      if (drawerMode === AnnotationDrawerMode.AddAnnotation) {
        dispatch(
          addPolygon({
            box: annotation.box,
            modelType: VisionAPIType.ObjectDetection, // TODO: should depend on model type
          })
        );
      }
      if (drawerMode === AnnotationDrawerMode.LinkAsset) {
        dispatch(
          addPolygon({
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
      dispatch(UpdateAnnotationsById([annotation.id]));
    }
  };

  return (
    <ImagePreview
      fileObj={file}
      annotations={visibleNonRejectedAnnotationsAndEditModeAnnotation}
      editable={imagePreviewEditable}
      creatable={imagePreviewCreatable}
      onCreateAnnotation={handleCreateAnnotation}
      onUpdateAnnotation={handleModifyAnnotation}
    />
  );
};
