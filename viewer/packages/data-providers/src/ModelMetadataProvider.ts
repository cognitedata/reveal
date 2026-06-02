/*!
 * Copyright 2021 Cognite AS
 */
import type * as THREE from 'three';
import type { ModelIdentifier } from './ModelIdentifier';
import type { BlobOutputMetadata, File3dFormat } from './types';

/**
 * Provides metadata for 3D models.
 */
export interface ModelMetadataProvider {
  getModelOutputs(modelIdentifier: ModelIdentifier): Promise<BlobOutputMetadata[]>;
  getModelUri(identifier: ModelIdentifier, formatMetadata: BlobOutputMetadata): Promise<string>;
  getModelCamera(identifier: ModelIdentifier): Promise<{ position: THREE.Vector3; target: THREE.Vector3 } | undefined>;
  getModelMatrix(identifier: ModelIdentifier, format: File3dFormat | string): Promise<THREE.Matrix4>;
}
