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
  | 'cadNodeTransformOverridden';

export type EventProps = {
  [key: string]: any;
};
