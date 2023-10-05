import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

import { Cognite3DViewer } from '@cognite/reveal';

import { updatePendingAnnotation } from '../useContextualizeThreeDViewerStore';

export enum TransformMode {
  TRANSLATE = 'translate',
  SCALE = 'scale',
}

export const createTransformControls = (
  viewer: Cognite3DViewer
): TransformControls | null => {
  const transformControls = new TransformControls(
    viewer.cameraManager.getCamera(),
    viewer.domElement
  );

  addDraggingChangedListener(transformControls, viewer);
  addChangeListener(transformControls, viewer);
  addKeydownListener(transformControls);
  addMouseUpListener(transformControls);
  // default to scaling
  setTransformMode(transformControls, TransformMode.SCALE);

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

const onKeydown = (
  event: KeyboardEvent,
  transformControls: TransformControls
): void => {
  switch (event.code) {
    case 'KeyM':
      setTransformMode(transformControls, TransformMode.TRANSLATE);
      break;
    case 'KeyR':
      setTransformMode(transformControls, TransformMode.SCALE);
      break;
  }
};

const setTransformMode = (
  transformControls: TransformControls,
  mode: TransformMode
): void => {
  transformControls.setMode(mode);
};

const addDraggingChangedListener = (
  transformControls: TransformControls,
  viewer: Cognite3DViewer
): void => {
  transformControls.addEventListener('dragging-changed', (event) => {
    onDraggingChanged(event, viewer);
  });
};

const addChangeListener = (
  transformControls: TransformControls,
  viewer: Cognite3DViewer
): void => {
  transformControls.addEventListener('change', () => {
    onChange(viewer);
  });
};

const addKeydownListener = (transformControls: TransformControls): void => {
  window.addEventListener('keydown', (event) => {
    onKeydown(event, transformControls);
  });
};

const addMouseUpListener = (transformControls: TransformControls): void => {
  transformControls.addEventListener('mouseUp', () => {
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
  });
};
