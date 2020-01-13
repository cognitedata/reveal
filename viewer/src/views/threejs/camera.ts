/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';

import { suggestCameraConfig as revealSuggestCameraConfig } from '../../utils/cameraUtils';
import { SectorMetadata } from '../../models/sector/types';
import { CadModel } from '../../models/sector/CadModel';
import { toThreeVector3 } from './utilities';

export interface SuggestedCameraConfig {
  position: THREE.Vector3;
  target: THREE.Vector3;
  near: number;
  far: number;
}

export function suggestCameraConfig(model: CadModel): SuggestedCameraConfig {
  const { position, target, near, far } = revealSuggestCameraConfig(model.scene.root);

  return {
    position: toThreeVector3(position, model.modelTransformation),
    target: toThreeVector3(target, model.modelTransformation),
    near,
    far
  };
}
