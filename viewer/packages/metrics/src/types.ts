/*!
 * Copyright 2021 Cognite AS
 */

export type TrackedEvents =
  | 'init'
  | 'construct3dViewer'
  | 'loadModel'
  | 'error'
  | 'cameraNavigated'
  | 'toolCreated'
  | 'cadModelStyleAssigned'
  | 'cadNodeTransformOverridden'
  | '360ImageCollectionAdded'
  | '360ImageEntered'
  | '360ImageTransitioned'
  | '360ImageExited'
  | 'measurementAdded';

export type EventProps = {
  [key: string]: any;
};
