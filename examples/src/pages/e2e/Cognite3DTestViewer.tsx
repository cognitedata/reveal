import React, { useEffect, useRef, useState } from 'react';
import { Container } from '../../components/styled';
import { AddModelOptions, Cognite3DModel, Cognite3DViewer, Cognite3DViewerOptions, CognitePointCloudModel, GeometryFilter } from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';
import { isLocalUrlPointCloudModel } from '../../utils/isLocalUrlPointCloudModel';

type Props = {
  viewerOptions?: Cognite3DViewerOptions;

  modelUrls: string[];
  fitCameraToModel?: boolean;
  geometryFilter?: GeometryFilter;

  cadModelAddedCallback?: (model: Cognite3DModel, modelIndex: number, modelUrl: string) => void;
  pointCloudModelAddedCallback?: (model: CognitePointCloudModel, modelIndex: number, modelUrl: string) => void;

  initializeCallback?: (viewer: Cognite3DViewer) => void;
};

type LoadingState = {
  itemsLoaded: number;
  itemsRequested: number;
  itemsCulled: number;
}

export function Cognite3DTestViewer(props: Props) {
  const { viewerOptions, modelUrls, geometryFilter, fitCameraToModel } = props;
  const { cadModelAddedCallback, pointCloudModelAddedCallback, initializeCallback } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(
    { itemsLoaded: 0, itemsRequested: Infinity, itemsCulled: 0 }
  );

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    // Prepare viewer
    const options: Cognite3DViewerOptions = {
      domElement: containerRef.current,
      onLoading: (itemsLoaded, itemsRequested, itemsCulled) => setLoadingState({ itemsLoaded, itemsRequested, itemsCulled }),
      // Note! Pure fake - we will not contact CDF during our tests
      sdk: new CogniteClient({
        appId: 'reveal-visual-tests',
        project: 'dummy',
        getToken: async () => 'dummy'
      }),
      // Instruct viewer to load models from local storage
      // @ts-expect-error
      _localModels: true,
      // Dont use any post-processing effects
      antiAliasingHint: 'disabled',
      ssaoQualityHint: 'disabled',
      enableEdges: false,

      // Let provided options override options above
      ...viewerOptions,
    }
    const viewer = new Cognite3DViewer(options);
    if (initializeCallback) {
      initializeCallback(viewer);
    }

    async function addModel(modelIndex: number, modelUrl: string, geometryFilter?: GeometryFilter) {
      const fullModelUrl = `${window.location.origin}/${modelUrl}`;
      const isPointCloud = await isLocalUrlPointCloudModel(fullModelUrl);
      const addOptions: AddModelOptions = {
        modelId: -1,
        revisionId: -1,
        localPath: modelUrl,
        geometryFilter
      };
      const model = await (async () => {
        if (isPointCloud) {
          const model = await viewer.addPointCloudModel(addOptions);
          if (pointCloudModelAddedCallback) {
            pointCloudModelAddedCallback(model, modelIndex, modelUrl);
          }
          return model;
        } else {
          const model = await viewer.addCadModel(addOptions);
          if (cadModelAddedCallback) {
            cadModelAddedCallback(model, modelIndex, modelUrl);
          }
          return model;
        }
      })();

      if (fitCameraToModel !== false) {
        viewer.fitCameraToModel(model, 0);
      }
    }

    modelUrls.forEach((modelUrl, modelIndex) => addModel(modelIndex, modelUrl, geometryFilter));

    return () => {
      viewer && viewer.dispose();
    };
  }, [geometryFilter, initializeCallback, cadModelAddedCallback, pointCloudModelAddedCallback, modelUrls, viewerOptions, fitCameraToModel]);

  const readyForScreenshot = loadingState.itemsLoaded > 0 &&
    loadingState.itemsLoaded === loadingState.itemsRequested;

  return (
    <>
      <Container ref={containerRef} />
      {readyForScreenshot && <div id="ready">Ready</div>}
    </>
  );
}
