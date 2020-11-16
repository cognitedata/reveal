import React, { useEffect, useRef, useState } from 'react';
import {
  revealEnv,
  Cognite3DModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  CogniteModelBase,
} from '@cognite/reveal';

import styled from 'styled-components';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import * as THREE from 'three';
import ThreeDViewerToolbar from '../ThreeDViewerToolbar';
import { ThreeDViewerProps } from './ThreeDViewer.d';
import { Legacy3DModel, Legacy3DViewer } from './legacyViewerTypes';

revealEnv.publicPath =
  'https://cdf-hub-bundles.cogniteapp.com/dependencies/@cognite/reveal-parser-worker/1.0.0-beta-1/';

const CanvasContainer = styled.div`
  height: calc(
    100vh - var(--cdf-ui-navigation-height) - 40px
  ); /* sidebar height and top-bot paddings subtracted */
  canvas {
    height: 100%;
    width: 100%;
  }
`;

export default function ThreeDViewer(props: ThreeDViewerProps) {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<Error>();
  const [model, setModel] = useState<
    Cognite3DModel | CognitePointCloudModel | Legacy3DModel
  >();
  const [viewer, setViewer] = useState<Cognite3DViewer | Legacy3DViewer>();

  const modelId = +props.modelId;
  const { id: revisionId } = props.revision;

  useEffect(() => {
    if (canvasWrapperRef.current) {
      canvasWrapperRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, []);

  // set viewer
  useEffect(() => {
    let viewerLocal: Cognite3DViewer | Legacy3DViewer;
    (async () => {
      if (!canvasWrapperRef.current) {
        return;
      }

      viewerLocal = new props.ViewerConstructor({
        sdk,
        domElement: canvasWrapperRef.current,
      } as any);
      setViewer(viewerLocal);
    })();

    return () => viewerLocal?.dispose();
  }, [revisionId, props.ViewerConstructor]);

  // set model
  useEffect(() => {
    (async () => {
      if (!viewer) {
        return;
      }
      let modelLocal: CognitePointCloudModel | Cognite3DModel | Legacy3DModel;

      try {
        if (viewer instanceof Cognite3DViewer) {
          const modelType = await viewer.determineModelType(
            modelId,
            revisionId
          );
          switch (modelType) {
            case 'cad': {
              modelLocal = await viewer.addModel({ modelId, revisionId });
              break;
            }
            case 'pointcloud': {
              modelLocal = await viewer.addPointCloudModel({
                modelId,
                revisionId,
              });
              break;
            }
            default: {
              throw new Error(`Unsupported model type ${modelType}`);
            }
          }
        } else {
          modelLocal = await viewer.addModel({ modelId, revisionId });
        }
      } catch (e) {
        if (canvasWrapperRef.current) {
          setError(e);
        }
        return;
      }

      if ('loadCameraFromModel' in viewer) {
        viewer.loadCameraFromModel(modelLocal as CogniteModelBase);
      } else {
        // legacy way of loading camera position from the revision
        const { target, position } = props.revision.camera!;
        if (Array.isArray(target) && Array.isArray(position)) {
          // Create three.js objects
          const positionVector = new THREE.Vector3(...position);
          const targetVector = new THREE.Vector3(...target);
          // Apply transformation matrix
          positionVector.applyMatrix4(modelLocal.matrix);
          targetVector.applyMatrix4(modelLocal.matrix);
          // Set on viewer
          viewer.setCameraPosition(positionVector);
          viewer.setCameraTarget(targetVector);
        } else {
          viewer.fitCameraToModel(modelLocal as Legacy3DModel, 0);
        }
      }

      if (canvasWrapperRef.current) {
        setModel(modelLocal);
      }
    })();
    // props.camera updates is not something that should trigger that hook
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer, modelId, revisionId]);

  if (error) {
    throw error;
  }
  return (
    <div style={{ position: 'relative' }}>
      {viewer && model && <ThreeDViewerToolbar viewer={viewer} model={model} />}
      <CanvasContainer ref={canvasWrapperRef} />
    </div>
  );
}
