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
  addKeydownListener();
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

const addKeydownListener = (): void => {
  window.addEventListener('keydown', (event) => {
    onKeydown(event);
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
