/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { ModelDataClient } from './types';
import { fetchWithStatusCheck } from './utilities';
import { File3dFormat, CameraConfiguration } from '../types';
import { applyDefaultModelTransformation } from './applyDefaultModelTransformation';

export class LocalModelDataClient implements ModelDataClient<{ fileName: string }> {
  getModelUrl(params: { fileName: string }): Promise<string> {
    return Promise.resolve(`${location.origin}/${params.fileName}`);
  }

  get headers() {
    return {};
  }

  async getBinaryFile(blobUrl: string, fileName: string): Promise<ArrayBuffer> {
    const response = await fetchWithStatusCheck(`${blobUrl}/${fileName}`);
    return response.arrayBuffer();
  }

  async getJsonFile(blobUrl: string, fileName: string): Promise<any> {
    const response = await fetchWithStatusCheck(`${blobUrl}/${fileName}`);
    return response.json();
  }

  async getModelMatrix(_identifier: { fileName: string }): Promise<THREE.Matrix4> {
    const matrix = new THREE.Matrix4();
    applyDefaultModelTransformation(matrix, File3dFormat.RevealCadModel);
    return matrix;
  }

  getModelCamera(_identifier: { fileName: string }): Promise<CameraConfiguration | undefined> {
    return Promise.resolve(undefined);
  }

  getApplicationIdentifier(): string {
    return 'LocalClient';
  }
}
