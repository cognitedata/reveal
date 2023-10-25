import { type ReactElement, useEffect } from 'react';

import { ToolBar, Tooltip, Button } from '@cognite/cogs.js';
import { useReveal, RevealToolbar } from '@cognite/reveal-react-components';

import { ANNOTATION_RADIUS_FACTOR } from '../../../../../pages/ContextualizeEditor/constants';
import {
  CubeAnnotation,
  ToolType,
  setPendingAnnotation,
  setThreeDViewer,
  setTool,
  toggleShouldShowBoundingVolumes,
  toggleShouldShowWireframes,
  useContextualizeThreeDViewerStore,
} from '../../../useContextualizeThreeDViewerStore';

export const PointCloudToolBarTools = (): ReactElement => {
  const viewer = useReveal();

  const {
    pendingAnnotation,
    tool,
    shouldShowBoundingVolumes,
    shouldShowWireframes,
  } = useContextualizeThreeDViewerStore((state) => ({
    pendingAnnotation: state.pendingAnnotation,
    tool: state.tool,
    shouldShowBoundingVolumes: state.shouldShowBoundingVolumes,
    shouldShowWireframes: state.shouldShowWireframes,
  }));

  // NOTE: This isn't the cleanest place to put this (it feels quite arbitrary that it is in the ToolBar file), but it's fine for now.
  //       The problem here is that the RevealContainer provider is added in the ContextualizeThreeDViewer component, which is a parent of this component.
  //       The most logical place to put the following useEffect would be in the ContextualizeThreeDViewer component, but we don't have access to the viewer there.
  useEffect(() => {
    setThreeDViewer(viewer);
  }, [viewer]);

  useEffect(() => {
    const onClick = async (event) => {
      const intersection = await viewer.getIntersectionFromPixel(
        event.offsetX,
        event.offsetY
      );
      if (
        intersection === null ||
        tool !== ToolType.ADD_ANNOTATION ||
        pendingAnnotation !== null
      ) {
        return;
      }
      const distance = viewer.cameraManager
        .getCamera()
        .position.distanceTo(intersection.point);
      const CubeSize = distance * ANNOTATION_RADIUS_FACTOR;
      const cubeAnnotation: CubeAnnotation = {
        position: {
          x: intersection.point.x,
          y: intersection.point.y,
          z: intersection.point.z,
        },
        size: {
          x: CubeSize,
          y: CubeSize,
          z: CubeSize,
        },
      };
      setPendingAnnotation(cubeAnnotation);
    };
    viewer.on('click', onClick);
    return () => {
      viewer.off('click', onClick);
    };
  }, [viewer, pendingAnnotation, tool]);

  const handleToolClick = (toolType: ToolType) => {
    setTool(toolType);
  };

  return (
    <ToolBar direction="vertical">
      <>
        <Tooltip content="Slider" position="right">
          <RevealToolbar.SlicerButton />
        </Tooltip>
        <Tooltip content="Toggle annotations visibility" position="right">
          <Button
            icon="EyeShow"
            aria-label="Toggle annotations visibility"
            type="ghost"
            toggled={shouldShowBoundingVolumes}
            onClick={toggleShouldShowBoundingVolumes}
          />
        </Tooltip>
        <Tooltip content="Toggle wireframe visibility" position="right">
          <Button
            icon="Cube"
            aria-label="Toggle wireframe visibility"
            type="ghost"
            toggled={shouldShowWireframes}
            onClick={toggleShouldShowWireframes}
          />
        </Tooltip>
      </>
      <>
        <Tooltip content="Select Tool" position="right">
          <Button
            icon="Cursor"
            type="ghost"
            aria-label="Select tool"
            toggled={tool === ToolType.SELECT_TOOL}
            onClick={() => handleToolClick(ToolType.SELECT_TOOL)}
          />
        </Tooltip>
        <Tooltip content="Add annotation" position="right">
          <Button
            icon="AddLarge"
            type="ghost"
            aria-label="Add annotation tool"
            toggled={tool === ToolType.ADD_ANNOTATION}
            onClick={() => handleToolClick(ToolType.ADD_ANNOTATION)}
          />
        </Tooltip>
      </>
    </ToolBar>
  );
};
