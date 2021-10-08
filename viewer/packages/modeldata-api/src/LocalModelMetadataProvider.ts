/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { ModelMetadataProvider } from './types';
import { File3dFormat, CameraConfiguration } from './types';
import { applyDefaultModelTransformation } from './applyDefaultModelTransformation';

export class LocalModelMetadataProvider implements ModelMetadataProvider<{ fileName: string }> {
  getModelUri(params: { fileName: string }): Promise<string> {
    return Promise.resolve(`${location.origin}/${params.fileName}`);
  }

  async getModelMatrix(_identifier: { fileName: string }): Promise<THREE.Matrix4> {
    const matrix = new THREE.Matrix4();
    applyDefaultModelTransformation(matrix, File3dFormat.RevealCadModel);
    return matrix;
  }

  getModelCamera(_identifier: { fileName: string }): Promise<CameraConfiguration | undefined> {
    return Promise.resolve(undefined);
  }
}
