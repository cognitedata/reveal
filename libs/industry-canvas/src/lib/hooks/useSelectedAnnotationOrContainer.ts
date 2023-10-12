import { useEffect, useMemo } from 'react';

import {
  UnifiedViewer,
  UnifiedViewerEventType,
} from '@cognite/unified-file-viewer';

import {
  setSelectedIdsByType,
  useIndustrialCanvasStore,
} from '../state/useIndustrialCanvasStore';
import { CanvasAnnotation, IndustryCanvasContainerConfig } from '../types';

type UseSelectedAnnotationOrContainerProps = {
  unifiedViewerRef: UnifiedViewer | null;
  canvasAnnotations: CanvasAnnotation[];
  containers: IndustryCanvasContainerConfig[];
};

export const useSelectedAnnotationOrContainer = ({
  unifiedViewerRef,
  canvasAnnotations,
  containers,
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
    if (
      selectedIdsByType.annotationIds.length !== 1 ||
      selectedIdsByType.containerIds.length !== 0
    ) {
      return undefined;
    }

    return canvasAnnotations.find(
      (annotation) => annotation.id === selectedIdsByType.annotationIds[0]
    );
  }, [canvasAnnotations, selectedIdsByType]);

  const selectedContainers = useMemo(() => {
    if (
      selectedIdsByType.containerIds.length === 0 ||
      selectedIdsByType.annotationIds.length !== 0
    ) {
      return [];
    }

    return containers.filter(({ id }) =>
      selectedIdsByType.containerIds.includes(id)
    );
  }, [containers, selectedIdsByType]);

  return {
    selectedCanvasAnnotation,
    selectedContainers,
  };
};
