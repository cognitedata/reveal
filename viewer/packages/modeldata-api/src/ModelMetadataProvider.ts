/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { ModelIdentifier } from './ModelIdentifier';

export interface ModelMetadataProvider {
  getModelUrl(identifier: ModelIdentifier): Promise<string>;
  getModelCamera(identifier: ModelIdentifier): Promise<{ position: THREE.Vector3; target: THREE.Vector3 } | undefined>;
  getModelMatrix(identifier: ModelIdentifier): Promise<THREE.Matrix4>;
}
