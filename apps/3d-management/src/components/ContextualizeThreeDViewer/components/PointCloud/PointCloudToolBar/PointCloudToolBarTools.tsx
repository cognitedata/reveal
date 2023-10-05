import { type ReactElement, useEffect } from 'react';

import * as THREE from 'three';

import { ToolBar, Tooltip, Button } from '@cognite/cogs.js';
import {
  AnnotationIdPointCloudObjectCollection,
  Cognite3DViewer,
  CognitePointCloudModel,
} from '@cognite/reveal';
import { useReveal, RevealToolbar } from '@cognite/reveal-react-components';

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
import { getCognitePointCloudModel } from '../../../utils/getCognitePointCloudModel';
import { isPointCloudIntersection } from '../../../utils/isPointCloudIntersection';
import { showBoundingVolumes } from '../../../utils/showBoundingVolumes';

const deleteBoundingVolumes = ({
  viewer,
  pointCloudModel,
  onDeleteAnnotation,
}: {
  viewer: Cognite3DViewer;
  pointCloudModel: CognitePointCloudModel;
  onDeleteAnnotation: (annotationId: number) => void;
}) => {
  // TODO: It is a somewhat inconsistent that this onClick handler is added here, while the other onClick handler is added in the useEffect hook below.
  //       Investigate how to do this in a more consistent way.
  // Tracked by: https://cognitedata.atlassian.net/browse/BND3D-2156v
  viewer.on('click', async (event) => {
    const intersection = await viewer.getIntersectionFromPixel(
      event.offsetX,
      event.offsetY
    );
    if (intersection === null || !isPointCloudIntersection(intersection)) {
      return;
    }

    const { annotationId } = intersection;

    // TODO: This is a bad design decision from Reveal.
    //       It should return type `number | undefined` instead of `number` where 0 is used to convey that the annotationId doesn't exist.
    // Tracked by: https://cognitedata.atlassian.net/browse/BND3D-2175
    if (annotationId === 0) {
      return;
    }

    const objectCollection = new AnnotationIdPointCloudObjectCollection([
      annotationId,
    ]);
    const appearance = { color: new THREE.Color(1, 0, 0) };

    pointCloudModel.assignStyledObjectCollection(objectCollection, appearance);
    onDeleteAnnotation(annotationId);
  });
};

type PointCloudToolBarToolsProps = {
  onDeleteAnnotation: (annotationId: number) => void;
};

export const PointCloudToolBarTools = ({
  onDeleteAnnotation,
}: PointCloudToolBarToolsProps): ReactElement => {
  const viewer = useReveal();

  const {
    pendingAnnotation,
    tool,
    shouldShowBoundingVolumes,
    shouldShowWireframes,
    modelId,
  } = useContextualizeThreeDViewerStore((state) => ({
    pendingAnnotation: state.pendingAnnotation,
    tool: state.tool,
    shouldShowBoundingVolumes: state.shouldShowBoundingVolumes,
    shouldShowWireframes: state.shouldShowWireframes,
    modelId: state.modelId,
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
      if (intersection === null || tool !== ToolType.ADD_ANNOTATION) {
        return;
      }

      const cubeAnnotation: CubeAnnotation = {
        position: {
          x: intersection.point.x,
          y: intersection.point.y,
          z: intersection.point.z,
        },
        size: {
          x: 2,
          y: 2,
          z: 2,
        },
      };
      setPendingAnnotation(cubeAnnotation);
    };
    viewer.on('click', onClick);
    return () => {
      viewer.off('click', onClick);
    };
  }, [viewer, pendingAnnotation, tool]);

  const handleAddAnnotationToolClick = () => {
    if (tool === ToolType.ADD_ANNOTATION) {
      setTool(ToolType.NONE);
      return;
    }

    setTool(ToolType.ADD_ANNOTATION);
  };

  const handleDeleteAnnotationToolClick = () => {
    if (modelId === null) return;

    const pointCloudModel = getCognitePointCloudModel({
      modelId,
      viewer,
    });

    if (pointCloudModel === undefined || tool === ToolType.DELETE_ANNOTATION) {
      setTool(ToolType.NONE);
      return;
    }

    setTool(ToolType.DELETE_ANNOTATION);
    deleteBoundingVolumes({ viewer, pointCloudModel, onDeleteAnnotation });
    showBoundingVolumes(pointCloudModel);
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
            disabled={tool === ToolType.DELETE_ANNOTATION}
            onClick={toggleShouldShowBoundingVolumes}
          />
        </Tooltip>
        <Tooltip content="Toggle wireframe visibility" position="right">
          <Button
            icon="Cube"
            aria-label="Toggle wireframe visibility"
            type="ghost"
            toggled={shouldShowWireframes}
            disabled={tool === ToolType.DELETE_ANNOTATION}
            onClick={toggleShouldShowWireframes}
          />
        </Tooltip>
      </>
      <>
        <Tooltip content="Add annotation" position="right">
          <Button
            icon="AddLarge"
            type="ghost"
            aria-label="Add annotation tool"
            toggled={tool === ToolType.ADD_ANNOTATION}
            onClick={handleAddAnnotationToolClick}
          />
        </Tooltip>
        <Tooltip content="Delete annotation" position="right">
          <Button
            icon="Delete"
            type="ghost"
            aria-label="Delete annotation tool"
            toggled={tool === ToolType.DELETE_ANNOTATION}
            onClick={handleDeleteAnnotationToolClick}
          />
        </Tooltip>
      </>
    </ToolBar>
  );
};
