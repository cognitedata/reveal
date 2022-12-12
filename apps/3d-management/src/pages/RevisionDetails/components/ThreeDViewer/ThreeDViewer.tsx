import React, { useEffect, useRef, useState } from 'react';
import {
  CogniteCadModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  CogniteModel,
  PointSizeType,
  DefaultCameraManager,
  AxisViewTool,
} from '@cognite/reveal';

import styled from 'styled-components';
import sdk from '@cognite/cdf-sdk-singleton';
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

const StyledToolBar = styled.div`
  position: absolute;
  left: 30px;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  width: fit-content;
  height: fit-content;
  padding: 4px;
  border-radius: 4px;
  background-color: white;
`;

export default function ThreeDViewer(props: ThreeDViewerProps) {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<Error>();
  const [model, setModel] = useState<
    CogniteCadModel | CognitePointCloudModel
  >();
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
      let modelLocal: CognitePointCloudModel | CogniteCadModel;

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
            modelLocal.pointSizeType = PointSizeType.Attenuated;
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

      viewer.loadCameraFromModel(modelLocal as CogniteModel);

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
      <CanvasContainer ref={canvasWrapperRef} />

      {viewer && model && (
        <ThreeDViewerSidebar
          viewer={viewer}
          model={model}
          nodesClickable={nodesClickable}
        />
      )}
      {viewer && model && canvasWrapperRef.current && (
        <StyledToolBar>
          <OverlayToolbar
            viewer={viewer}
            model={model}
            setNodesClickable={setNodesClickable}
            nodesClickable={nodesClickable}
          />
        </StyledToolBar>
      )}
    </ThreeDViewerStyled>
  );
}
