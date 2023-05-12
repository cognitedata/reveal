/*!
 * Copyright 2021 Cognite AS
 */

export type TrackedEvents =
  | 'init'
  | 'construct3dViewer'
  | 'loadModel'
  | 'error'
  | 'cameraNavigated'
  | 'sessionEnded'
  | 'toolCreated'
  | 'cadModelStyleAssigned'
  | 'cadNodeTransformOverridden'
  | '360ImageCollectionAdded'
  | '360ImageEntered'
  | '360ImageTransitioned'
  | '360ImageExited'
  | 'measurementAdded'
  | 'texturedModelLoaded';

export type EventProps = {
  [key: string]: any;
};
