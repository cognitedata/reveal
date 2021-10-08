/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { ModelDataClient, File3dFormat } from '@reveal/cad-parsers';
import { CameraConfiguration } from '@reveal/utilities';

import { fetchWithStatusCheck } from './utilities';
import { applyDefaultModelTransformation } from './applyDefaultModelTransformation';

export class LocalModelDataClient implements ModelDataClient<{ fileName: string }> {
  getModelUrl(params: { fileName: string }): Promise<string> {
    return Promise.resolve(`${location.origin}/${params.fileName}`);
  }

  get headers() {
    return {};
  }

  async getBinaryFile(baseUrl: string, fileName: string): Promise<ArrayBuffer> {
    const response = await fetchWithStatusCheck(`${baseUrl}/${fileName}`);
    return response.arrayBuffer();
  }

  async getJsonFile(baseUrl: string, fileName: string): Promise<any> {
    const response = await fetchWithStatusCheck(`${baseUrl}/${fileName}`);
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
