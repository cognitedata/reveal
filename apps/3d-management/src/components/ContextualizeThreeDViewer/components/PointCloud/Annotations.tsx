import { FC, useEffect, useMemo } from 'react';

import { head } from 'lodash';
import { Matrix4 } from 'three';

import { Cognite3DViewer } from '@cognite/reveal';
import { useReveal } from '@cognite/reveal-react-components';
import { AnnotationModel } from '@cognite/sdk';

import { useIntersectAnnotationVolumesOnClick } from '../../hooks/useIntersectAnnotationBoundsOnClick';
import {
  ToolType,
  setSelectedAnnotationId,
  useContextualizeThreeDViewerStore,
} from '../../useContextualizeThreeDViewerStore';
import { AnnotationsView } from '../../utils/annotations/AnnotationsView';
import { getCognitePointCloudModel } from '../../utils/getCognitePointCloudModel';

export const Annotations: FC = () => {
  const viewer = useReveal();
  const annotationsView = useMemo(() => new AnnotationsView(viewer), [viewer]);

  const {
    annotations,
    tool,
    selectedAnnotationId,
    modelId,
    shouldShowWireframes,
    isModelLoaded,
  } = useContextualizeThreeDViewerStore((state) => ({
    annotations: state.annotations,
    tool: state.tool,
    selectedAnnotationId: state.selectedAnnotationId,
    modelId: state.modelId,
    shouldShowWireframes: state.shouldShowWireframes,
    isModelLoaded: state.isModelLoaded,
  }));

  const matrix = useMemo(() => {
    if (modelId === null || !isModelLoaded) {
      return null;
    }
    return getPointCloudMatrix(modelId, viewer);
  }, [modelId, isModelLoaded, viewer]);

  useIntersectAnnotationVolumesOnClick(
    (intersectedAnnotationData) => {
      const intersectedAnnotationId =
        head(intersectedAnnotationData)?.annotationId ?? null;

      setSelectedAnnotationId(intersectedAnnotationId);
    },
    { enabled: tool === ToolType.SELECT_TOOL && shouldShowWireframes }
  );

  useGenerateAnnotationWireframes(
    annotations ?? [],
    matrix ?? new Matrix4(),
    annotationsView,
    viewer
  );

  useSetSelectedWireframe(annotationsView, selectedAnnotationId);

  useEffect(() => {
    if (shouldShowWireframes) {
      annotationsView.show();
    } else {
      annotationsView.hide();
      setSelectedAnnotationId(null);
    }
    viewer.requestRedraw();
  }, [shouldShowWireframes, annotationsView, viewer, annotations, matrix]);

  useEffect(() => {
    if (tool !== ToolType.SELECT_TOOL) {
      annotationsView.selectAll(false);
    }
  }, [tool, annotationsView]);

  return <></>;
};

function getPointCloudMatrix(
  modelId: number,
  viewer: Cognite3DViewer
): Matrix4 | null {
  return (
    getCognitePointCloudModel({
      modelId,
      viewer,
    })?.getCdfToDefaultModelTransformation() ?? null
  );
}

function useSetSelectedWireframe(
  annotationsView: AnnotationsView,
  selectedAnnotationId: number | null
) {
  useEffect(() => {
    if (selectedAnnotationId === null) {
      annotationsView.selectAll(false);
      return;
    }
    annotationsView.selectById(selectedAnnotationId);
  }, [selectedAnnotationId, annotationsView]);
}

function useGenerateAnnotationWireframes(
  annotations: AnnotationModel[],
  matrix: Matrix4,
  annotationsView: AnnotationsView,
  viewer: Cognite3DViewer
) {
  useEffect(() => {
    if (annotations === null || matrix === null) {
      return;
    }

    annotationsView.rebuild(annotations, matrix);

    const root = annotationsView.getRoot();
    if (!root) {
      return;
    }
    if (!root.parent) {
      viewer.addObject3D(root);
    }
    return () => viewer.removeObject3D(root);
  }, [annotations, matrix, viewer, annotationsView]);
}
