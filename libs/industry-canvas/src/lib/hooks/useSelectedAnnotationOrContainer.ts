import { useEffect, useMemo, useState } from 'react';

import {
  IdsByType,
  UnifiedViewer,
  UnifiedViewerEventType,
} from '@cognite/unified-file-viewer';

import {
  CanvasAnnotation,
  IndustryCanvasContainerConfig,
  IndustryCanvasToolType,
} from '../types';

import { EMPTY_IDS_BY_TYPE } from './constants';
import { UseManagedStateReturnType } from './useManagedState';

type UseSelectedAnnotationOrContainerProps = {
  unifiedViewerRef: UnifiedViewer | null;
  tool: IndustryCanvasToolType;
  canvasAnnotations: UseManagedStateReturnType['canvasAnnotations'];
  container: UseManagedStateReturnType['container'];
};

export type UseSelectedAnnotationOrContainerReturnType = {
  selectedCanvasAnnotation: CanvasAnnotation | undefined;
  selectedContainer: IndustryCanvasContainerConfig | undefined;
};

export const useSelectedAnnotationOrContainer = ({
  unifiedViewerRef,
  tool,
  canvasAnnotations,
  container,
}: UseSelectedAnnotationOrContainerProps) => {
  const [selectedIdsByType, setSelectedIdsByType] =
    useState<IdsByType>(EMPTY_IDS_BY_TYPE);

  useEffect(() => {
    return unifiedViewerRef?.addEventListener(
      UnifiedViewerEventType.ON_SELECT,
      setSelectedIdsByType
    );
  }, [unifiedViewerRef]);

  const selectedCanvasAnnotation = useMemo(() => {
    // This is to avoid the bug in UFV where the ON_SELECT is not emitted with empty IDs when changing tool
    if (tool !== IndustryCanvasToolType.SELECT) {
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
  }, [canvasAnnotations, selectedIdsByType, tool]);

  const selectedContainer = useMemo(() => {
    // This is to avoid the bug in UFV where the ON_SELECT is not emitted with empty IDs when changing tool
    if (tool !== IndustryCanvasToolType.SELECT) {
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
  }, [container.children, selectedIdsByType, tool]);

  return {
    selectedCanvasAnnotation,
    selectedContainer,
  };
};
