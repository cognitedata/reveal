import { useEffect, useMemo } from 'react';

import {
  UnifiedViewer,
  UnifiedViewerEventType,
} from '@cognite/unified-file-viewer';

import {
  setSelectedIdsByType,
  useIndustrialCanvasStore,
} from '../state/useIndustrialCanvasStore';
import { IndustryCanvasState, IndustryCanvasToolType } from '../types';

type UseSelectedAnnotationOrContainerProps = {
  unifiedViewerRef: UnifiedViewer | null;
  toolType: IndustryCanvasToolType;
  canvasAnnotations: IndustryCanvasState['canvasAnnotations'];
  container: IndustryCanvasState['container'];
};

export const useSelectedAnnotationOrContainer = ({
  unifiedViewerRef,
  toolType,
  canvasAnnotations,
  container,
}: UseSelectedAnnotationOrContainerProps) => {
  const { selectedIdsByType } = useIndustrialCanvasStore((state) => ({
    selectedIdsByType: state.selectedIdsByType,
  }));

  useEffect(() => {
    unifiedViewerRef?.addEventListener(
      UnifiedViewerEventType.ON_SELECT,
      setSelectedIdsByType
    );
    return () => {
      unifiedViewerRef?.removeEventListener(
        UnifiedViewerEventType.ON_SELECT,
        setSelectedIdsByType
      );
    };
  }, [unifiedViewerRef]);

  const selectedCanvasAnnotation = useMemo(() => {
    // This is to avoid the bug in UFV where the ON_SELECT is not emitted with empty IDs when changing tool
    if (toolType !== IndustryCanvasToolType.SELECT) {
      return undefined;
    }

    if (
      selectedIdsByType.annotationIds.length !== 1 ||
      selectedIdsByType.containerIds.length !== 0
    ) {
      return undefined;
    }

    return canvasAnnotations.find(
      (annotation) => annotation.id === selectedIdsByType.annotationIds[0]
    );
  }, [canvasAnnotations, selectedIdsByType, toolType]);

  const selectedContainer = useMemo(() => {
    // This is to avoid the bug in UFV where the ON_SELECT is not emitted with empty IDs when changing tool
    if (toolType !== IndustryCanvasToolType.SELECT) {
      return undefined;
    }

    if (
      selectedIdsByType.containerIds.length !== 1 ||
      selectedIdsByType.annotationIds.length !== 0
    ) {
      return undefined;
    }

    return (container.children ?? []).find(
      (child) => child.id === selectedIdsByType.containerIds[0]
    );
  }, [container.children, selectedIdsByType, toolType]);

  return {
    selectedCanvasAnnotation,
    selectedContainer,
  };
};
