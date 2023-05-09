import {
  Annotation,
  AnnotationType,
  IdsByType,
  ToolType,
  UnifiedViewer,
} from '@cognite/unified-file-viewer';
import { UnifiedViewerPointerEvent } from '@cognite/unified-file-viewer/dist/core/UnifiedViewerRenderer/UnifiedEventHandler';
import { MutableRefObject, useCallback, useEffect, useState } from 'react';

const useEditOnSelect = (
  unifiedViewerRef: MutableRefObject<UnifiedViewer | null>,
  setTool: (tool: ToolType) => void
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
    // If the annotation has been selected by any means, and we register a mousedown on it,
    // enable editing for that annotation. The actual editing will be triggered onMouseUp
    // if the annotation was not dragged.
    setEditableAnnotationIds(selected.annotationIds);
  }, [selected.annotationIds]);

  const onAnnotationMouseUp = useCallback(
    (e: UnifiedViewerPointerEvent, annotation: Annotation) => {
      if (e.justDragged) {
        return;
      }

      if (!editableAnnotationIds.includes(annotation.id)) {
        return;
      }

      if (annotation.type === AnnotationType.STICKY) {
        setTool(ToolType.STICKY);
        setTimeout(() => {
          unifiedViewerRef.current?.editAnnotationById(annotation.id);
        }, 0);
      }

      if (annotation.type === AnnotationType.TEXT) {
        setTool(ToolType.TEXT);
        setTimeout(() => {
          unifiedViewerRef.current?.editAnnotationById(annotation.id);
        }, 0);
      }

      return;
    },
    [editableAnnotationIds, setTool, unifiedViewerRef]
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
