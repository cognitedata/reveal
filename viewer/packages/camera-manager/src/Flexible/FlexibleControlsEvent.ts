/*!
 * Copyright 2024 Cognite AS
 */

import { Vector3 } from 'three';
import { FlexibleControlsType } from './FlexibleControlsType';

/**
 * @beta
 */
export type FlexibleControlsEvent = {
  cameraChange: { content: { position: Vector3; target: Vector3 } };
  controlsTypeChange: { controlsType: FlexibleControlsType };
};
