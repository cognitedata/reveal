import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

import { Cognite3DViewer } from '@cognite/reveal';

import {
  updatePendingAnnotation,
  setTransformMode,
} from '../useContextualizeThreeDViewerStore';

export enum TransformMode {
  TRANSLATE = 'translate',
  SCALE = 'scale',
}

export const createTransformControls = (
  viewer: Cognite3DViewer
): TransformControls => {
  const transformControls = new TransformControls(
    viewer.cameraManager.getCamera(),
    viewer.domElement
  );

  addDraggingChangedListener(transformControls, viewer);
  addChangeListener(transformControls, viewer);
  addKeydownListener(viewer);
  addMouseUpListener(transformControls);
  return transformControls;
};

const onDraggingChanged = (event, viewer: Cognite3DViewer): void => {
  if (event.value) {
    viewer.cameraManager.deactivate();
  } else {
    viewer.cameraManager.activate();
  }
};

const onChange = (viewer: Cognite3DViewer): void => {
  viewer.requestRedraw();
};

const onKeydown = (event: KeyboardEvent): void => {
  switch (event.code) {
    case 'KeyT':
      setTransformMode(TransformMode.TRANSLATE);
      break;
    case 'KeyG':
      setTransformMode(TransformMode.SCALE);
      break;
  }
};

const onMouseUp = (transformControls: TransformControls): void => {
  if (transformControls.object === undefined) return;

  updatePendingAnnotation({
    position: {
      x: transformControls.object.position.x,
      y: transformControls.object.position.y,
      z: transformControls.object.position.z,
    },
    scale: {
      x: transformControls.object.scale.x,
      y: transformControls.object.scale.y,
      z: transformControls.object.scale.z,
    },
  });
};

const addDraggingChangedListener = (
  transformControls: TransformControls,
  viewer: Cognite3DViewer
): (() => void) => {
  const onDraggingChangedHandler = (event) => onDraggingChanged(event, viewer);
  transformControls.addEventListener(
    'dragging-changed',
    onDraggingChangedHandler
  );

  return () => {
    transformControls.removeEventListener(
      'dragging-changed',
      onDraggingChangedHandler
    );
  };
};

const addChangeListener = (
  transformControls: TransformControls,
  viewer: Cognite3DViewer
): (() => void) => {
  const onChangeHandler = () => onChange(viewer);
  transformControls.addEventListener('change', onChangeHandler);

  return () => {
    transformControls.removeEventListener('change', onChangeHandler);
  };
};

const addKeydownListener = (viewer: Cognite3DViewer): (() => void) => {
  const onKeydownHandler = (event) => onKeydown(event);
  viewer.domElement.addEventListener('keydown', onKeydownHandler);

  return () => {
    viewer.domElement.removeEventListener('keydown', onKeydownHandler);
  };
};

const addMouseUpListener = (
  transformControls: TransformControls
): (() => void) => {
  const onMouseUpHandler = () => onMouseUp(transformControls);
  transformControls.addEventListener('mouseUp', onMouseUpHandler);

  return () => {
    transformControls.removeEventListener('mouseUp', onMouseUpHandler);
  };
};
