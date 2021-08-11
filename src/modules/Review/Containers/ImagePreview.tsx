import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  deselectAllAnnotations,
  selectVisibleNonRejectedAnnotationsByFileId,
  VisibleAnnotation,
} from 'src/modules/Review/previewSlice';
import { Annotation } from 'src/api/types';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { ReactImageAnnotateWrapper } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/ReactImageAnnotateWrapper';
import { UnsavedAnnotation } from 'src/api/annotation/types';
import { DeleteAnnotationsAndHandleLinkedAssetsOfFile } from 'src/store/thunks/DeleteAnnotationsAndHandleLinkedAssetsOfFile';
import { CreateAnnotations } from 'src/store/thunks/CreateAnnotations';
import { UpdateAnnotations } from 'src/store/thunks/UpdateAnnotations';

export const ImagePreview = ({
  file,
  onEditMode,
}: {
  file: FileInfo;
  onEditMode: (editMode: boolean) => void;
}) => {
  const dispatch = useDispatch();
  const visibleNonRejectedAnnotations = useSelector(
    ({ previewSlice }: RootState) =>
      selectVisibleNonRejectedAnnotationsByFileId(
        previewSlice,
        String(file.id)
      ) as VisibleAnnotation[]
  );

  const selectedAnnotationIds = useSelector(
    (state: RootState) => state.previewSlice.selectedAnnotationIds
  );

  const annotations: VisibleAnnotation[] = useMemo(() => {
    return visibleNonRejectedAnnotations.map((ann) => {
      if (selectedAnnotationIds.includes(ann.id)) {
        return { ...ann, selected: true };
      }
      return { ...ann, selected: false };
    });
  }, [visibleNonRejectedAnnotations, selectedAnnotationIds]);

  const handleCreateAnnotation = (annotation: UnsavedAnnotation) => {
    dispatch(CreateAnnotations({ fileId: file.id, annotation }));
  };

  const handleModifyAnnotation = async (annotation: Annotation) => {
    await dispatch(UpdateAnnotations([annotation]));
    dispatch(deselectAllAnnotations());
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
    />
  );
};
