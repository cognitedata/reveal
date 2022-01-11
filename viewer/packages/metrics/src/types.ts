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
  | 'cadModelStyleAssigned';

export type EventProps = {
  [key: string]: any;
};
