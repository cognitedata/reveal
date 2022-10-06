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
  | 'measurementAdded';

export type EventProps = {
  [key: string]: any;
};
