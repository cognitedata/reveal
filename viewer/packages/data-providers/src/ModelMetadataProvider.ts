/*!
 * Copyright 2021 Cognite AS
 */
import type { Matrix4, Vector3 } from 'three';
import type { ModelIdentifier } from './ModelIdentifier';
import type { BlobOutputMetadata, File3dFormat } from './types';

/**
 * Provides metadata for 3D models.
 */
export interface ModelMetadataProvider {
  getModelOutputs(modelIdentifier: ModelIdentifier): Promise<BlobOutputMetadata[]>;
  getModelUri(identifier: ModelIdentifier, formatMetadata: BlobOutputMetadata): Promise<string>;
  getModelUriForSignedFiles(): Promise<string>;
  getModelCamera(identifier: ModelIdentifier): Promise<{ position: Vector3; target: Vector3 } | undefined>;
  getModelMatrix(identifier: ModelIdentifier, format: File3dFormat | string): Promise<Matrix4>;
}
