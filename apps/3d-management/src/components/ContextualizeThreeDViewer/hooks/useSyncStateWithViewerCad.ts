import { useEffect } from 'react';

import * as THREE from 'three';

import {
  Cognite3DViewer,
  CogniteCadModel,
  CognitePointCloudModel,
} from '@cognite/reveal';

import { useContextualizeThreeDViewerStoreCad } from '../useContextualizeThreeDViewerStoreCad';

export const useSyncStateWithViewerCad = () => {
  const { modelId, isModelLoaded, threeDViewer, tool, visualizationOptions } =
    useContextualizeThreeDViewerStoreCad((state) => ({
      modelId: state.modelId,
      isModelLoaded: state.isModelLoaded,
      threeDViewer: state.threeDViewer,
      tool: state.tool,
      visualizationOptions: state.visualizationOptions,
    }));

  // sync visualizationOptions with viewer
  useEffect(() => {
    if (threeDViewer === null) return;

    for (const model of threeDViewer.models)
      if (model instanceof CogniteCadModel) {
      }
  }, [visualizationOptions, threeDViewer]);
};
