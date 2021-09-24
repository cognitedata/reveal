import { FileInfo } from '@cognite/cdf-sdk-singleton';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UnsavedAnnotation } from 'src/api/annotation/types';
import { Annotation } from 'src/api/types';
import { ReactImageAnnotateWrapper } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/ReactImageAnnotateWrapper';
import {
  currentCollection,
  deSelectAllCollections,
  deselectAllKeypoints,
  nextKeyPoint,
  nextShape,
} from 'src/modules/Review/store/annotationLabelSlice';
import {
  deselectAllAnnotations,
  VisibleAnnotation,
} from 'src/modules/Review/store/reviewSlice';
import { RootState } from 'src/store/rootReducer';
import { CreateAnnotations } from 'src/store/thunks/Annotation/CreateAnnotations';
import { UpdateAnnotations } from 'src/store/thunks/Annotation/UpdateAnnotations';
import { DeleteAnnotationsAndHandleLinkedAssetsOfFile } from 'src/store/thunks/Review/DeleteAnnotationsAndHandleLinkedAssetsOfFile';
import { pushMetric } from 'src/utils/pushMetric';

export const ImagePreview = ({
  file,
  onEditMode,
  annotations,
}: {
  file: FileInfo;
  onEditMode: (editMode: boolean) => void;
  annotations: VisibleAnnotation[];
}) => {
  const dispatch = useDispatch();

  const definedCollection = useSelector(
    ({ annotationLabelReducer }: RootState) =>
      annotationLabelReducer.predefinedCollections
  );

  const currentShape = useSelector(({ annotationLabelReducer }: RootState) =>
    nextShape(annotationLabelReducer)
  );

  const nextPoint = useSelector(({ annotationLabelReducer }: RootState) =>
    nextKeyPoint(annotationLabelReducer)
  );

  const currentKeypointCollection = useSelector(
    ({ annotationLabelReducer }: RootState) =>
      currentCollection(annotationLabelReducer)
  );

  const handleCreateAnnotation = (annotation: UnsavedAnnotation) => {
    pushMetric('Vision.Review.CreateAnnotation');

    if (annotation?.region?.shape === 'rectangle') {
      pushMetric('Vision.Review.CreateAnnotation.Rectangle');
    }
    if (annotation?.region?.shape === 'points') {
      pushMetric('Vision.Review.CreateAnnotation.Points');
    }
    if (annotation?.region?.shape === 'polygon') {
      pushMetric('Vision.Review.CreateAnnotation.Polygon');
    }
    dispatch(CreateAnnotations({ fileId: file.id, annotation }));
  };

  const handleModifyAnnotation = async (annotation: Annotation) => {
    await dispatch(UpdateAnnotations([annotation]));
    dispatch(deselectAllAnnotations());
    dispatch(deSelectAllCollections());
    dispatch(deselectAllKeypoints());
  };

  const handleDeleteAnnotation = (annotation: Annotation) => {
    dispatch(
      DeleteAnnotationsAndHandleLinkedAssetsOfFile({
        annotationIds: [annotation.id],
        showWarnings: true,
      })
    );
  };

  const handleInEditMode = (mode: boolean) => {
    onEditMode(mode);
  };

  return (
    <ReactImageAnnotateWrapper
      fileInfo={file}
      annotations={annotations}
      onCreateAnnotation={handleCreateAnnotation}
      onUpdateAnnotation={handleModifyAnnotation}
      onDeleteAnnotation={handleDeleteAnnotation}
      handleInEditMode={handleInEditMode}
      collection={definedCollection}
      currentShape={currentShape}
      nextKeyPoint={nextPoint}
      currentCollection={currentKeypointCollection}
    />
  );
};
