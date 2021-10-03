/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { ModelIdentifier } from '..';
import { CameraConfiguration } from './types';

export interface ModelMetadataProvider {
  getModelUrl(identifier: ModelIdentifier): Promise<string>;
  getModelCamera(identifier: ModelIdentifier): Promise<CameraConfiguration | undefined>;
  getModelMatrix(identifier: ModelIdentifier): Promise<THREE.Matrix4>;
}
