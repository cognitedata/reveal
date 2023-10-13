import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import {
  setPendingAnnotation,
  setSelectedAnnotationId,
  setTransformMode,
  useContextualizeThreeDViewerStore,
} from '../../../useContextualizeThreeDViewerStore';
import { updateCdfThreeDAnnotation } from '../../../utils/annotations/updateCdfThreeDAnnotation';
import { getCognitePointCloudModel } from '../../../utils/getCognitePointCloudModel';
type useUpdateCdfThreeDAnnotationReturnType = () => void;

export const useUpdateCdfThreeDAnnotation =
  (): useUpdateCdfThreeDAnnotationReturnType => {
    const {
      threeDViewer,
      selectedAnnotationId,
      modelId,
      pendingAnnotation,
      annotations,
    } = useContextualizeThreeDViewerStore((state) => ({
      threeDViewer: state.threeDViewer,
      selectedAnnotationId: state.selectedAnnotationId,
      modelId: state.modelId,
      pendingAnnotation: state.pendingAnnotation,
      annotations: state.annotations,
    }));

    const sdk = useSDK();
    const queryClient = useQueryClient();

    const updateAnnotation = useCallback(() => {
      const annotation = annotations?.find(
        (annotation) => annotation.id === selectedAnnotationId
      );
      if (annotation === undefined) return;
      if (threeDViewer === null || modelId === null) return;
      const pointCloudModel = getCognitePointCloudModel({
        modelId,
        viewer: threeDViewer,
      });
      if (
        pointCloudModel === undefined ||
        selectedAnnotationId === null ||
        pendingAnnotation === null
      )
        return;
      updateCdfThreeDAnnotation({
        annotation,
        cubeAnnotation: pendingAnnotation,
        sdk,
        pointCloudModel,
      }).then(() => {
        // Invalidate to refetch
        queryClient.invalidateQueries(['annotations', sdk, modelId]);
      });
      setTransformMode(null);
      setPendingAnnotation(null);
      setSelectedAnnotationId(null);
    }, [
      selectedAnnotationId,
      annotations,
      pendingAnnotation,
      sdk,
      modelId,
      threeDViewer,
      queryClient,
    ]);
    return updateAnnotation;
  };
