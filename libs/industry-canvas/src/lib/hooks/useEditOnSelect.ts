import { MutableRefObject, useCallback, useEffect, useState } from 'react';

import {
  Annotation,
  AnnotationType,
  IdsByType,
  UnifiedViewer,
} from '@cognite/unified-file-viewer';
import { UnifiedViewerPointerEvent } from '@cognite/unified-file-viewer/dist/core/UnifiedViewerRenderer/UnifiedEventHandler';

import { setToolType } from '../state/useIndustrialCanvasStore';
import { IndustryCanvasToolType } from '../types';

const useEditOnSelect = (
  unifiedViewerRef: MutableRefObject<UnifiedViewer | null>,
  tool: IndustryCanvasToolType
) => {
  const [selected, setSelected] = useState<IdsByType>({
    annotationIds: [],
    containerIds: [],
  });

  const handleSelect = useCallback(
    (idsByType: IdsByType) => {
      setSelected(idsByType);
    },
    [setSelected]
  );

  const [editableAnnotationIds, setEditableAnnotationIds] = useState<string[]>(
    []
  );

  useEffect(() => {
    if (selected.annotationIds.length === 0) {
      setEditableAnnotationIds([]);
    }
  }, [selected.annotationIds]);

  const onAnnotationMouseDown = useCallback(() => {
    if (tool !== IndustryCanvasToolType.SELECT) {
      return;
    }
    // If the annotation has been selected by any means, and we register a mousedown on it,
    // enable editing for that annotation. The actual editing will be triggered onMouseUp
    // if the annotation was not dragged.
    setEditableAnnotationIds(selected.annotationIds);
  }, [selected.annotationIds, tool]);

  const onAnnotationMouseUp = useCallback(
    (e: UnifiedViewerPointerEvent, annotation: Annotation) => {
      if (e.justDragged) {
        return;
      }

      if (!editableAnnotationIds.includes(annotation.id)) {
        return;
      }

      if (annotation.type === AnnotationType.STICKY) {
        setToolType(IndustryCanvasToolType.STICKY);
        setTimeout(() => {
          unifiedViewerRef.current?.editAnnotationById(annotation.id);
        }, 0);
      }

      if (annotation.type === AnnotationType.TEXT) {
        setToolType(IndustryCanvasToolType.TEXT);
        setTimeout(() => {
          unifiedViewerRef.current?.editAnnotationById(annotation.id);
        }, 0);
      }

      return;
    },
    [editableAnnotationIds, unifiedViewerRef]
  );

  const getAnnotationEditHandlers = useCallback(
    (annotation: Annotation) => {
      if (
        annotation.type !== AnnotationType.STICKY &&
        annotation.type !== AnnotationType.TEXT
      ) {
        return {};
      }

      return {
        onMouseDown: onAnnotationMouseDown,
        onMouseUp: onAnnotationMouseUp,
      };
    },
    [onAnnotationMouseDown, onAnnotationMouseUp]
  );

  return {
    handleSelect,
    getAnnotationEditHandlers,
  };
};

export default useEditOnSelect;
