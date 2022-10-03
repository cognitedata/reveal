import React, { useEffect, useRef, useState } from 'react';
import {
  Cognite3DModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  CogniteModelBase,
  PotreePointSizeType,
  DefaultCameraManager,
} from '@cognite/reveal';

import styled from 'styled-components';
import sdk from '@cognite/cdf-sdk-singleton';
import { AxisViewTool } from '@cognite/reveal/tools';
import { OverlayToolbar } from '../OverlayToolbar/OverlayToolbar';
import ThreeDViewerSidebar from '../ThreeDViewerSidebar';
import { ThreeDViewerProps } from './ThreeDViewer.d';

const ThreeDViewerStyled = styled.div`
  position: relative;
  display: flex;
  height: calc(
    100vh - var(--cdf-ui-navigation-height) - 40px
  ); /* sidebar height and top-bot paddings subtracted */
`;

const CanvasContainer = styled.div`
  flex-grow: 1;
  canvas {
    height: 100%;
    width: 100%;
  }
`;

export default function ThreeDViewer(props: ThreeDViewerProps) {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<Error>();
  const [model, setModel] = useState<Cognite3DModel | CognitePointCloudModel>();
  const [viewer, setViewer] = useState<Cognite3DViewer>();

  const modelId = +props.modelId;
  const { id: revisionId } = props.revision;

  const [nodesClickable, setNodesClickable] = useState<boolean>(true);

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
    let viewerLocal: Cognite3DViewer;
    (async () => {
      if (!canvasWrapperRef.current) {
        return;
      }

      viewerLocal = new Cognite3DViewer({
        sdk,
        domElement: canvasWrapperRef.current,
        continuousModelStreaming: true,
      });
      setViewer(viewerLocal);
    })();

    return () => viewerLocal?.dispose();
  }, [revisionId]);

  // setup axis tool
  useEffect(() => {
    let axisTool: AxisViewTool | undefined;
    if (viewer && viewer instanceof Cognite3DViewer) {
      axisTool = new AxisViewTool(viewer);
    }
    return () => {
      if (axisTool) {
        axisTool.dispose();
      }
    };
  }, [viewer]);

  // set model
  useEffect(() => {
    (async () => {
      if (!viewer) {
        return;
      }
      let modelLocal: CognitePointCloudModel | Cognite3DModel;

      try {
        (viewer.cameraManager as DefaultCameraManager).setCameraControlsOptions(
          {
            changeCameraTargetOnClick: true,
            mouseWheelAction: 'zoomToCursor',
          }
        );
        const modelType = await viewer.determineModelType(modelId, revisionId);
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
            modelLocal.pointSizeType = PotreePointSizeType.Attenuated;
            modelLocal.pointSize = 0.25;
            break;
          }
          default: {
            throw new Error(`Unsupported model type ${modelType}`);
          }
        }
      } catch (e) {
        if (e instanceof Error && canvasWrapperRef.current) {
          setError(e);
        }
        return;
      }

      viewer.loadCameraFromModel(modelLocal as CogniteModelBase);

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
    <ThreeDViewerStyled className="z-2">
      <CanvasContainer ref={canvasWrapperRef}>
        {viewer && model && (
          <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
            <OverlayToolbar
              viewer={viewer}
              model={model}
              setNodesClickable={setNodesClickable}
              nodesClickable={nodesClickable}
            />
          </div>
        )}
      </CanvasContainer>

      {viewer && model && (
        <ThreeDViewerSidebar
          viewer={viewer}
          model={model}
          nodesClickable={nodesClickable}
        />
      )}
    </ThreeDViewerStyled>
  );
}
