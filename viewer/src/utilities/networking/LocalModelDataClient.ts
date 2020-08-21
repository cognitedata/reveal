/*!
 * Copyright 2020 Cognite AS
 */
import * as THREE from 'three';

import { ModelDataClient } from './types';
import { fetchWithStatusCheck } from './utilities';
import { ModelTransformation } from '..';
import { File3dFormat } from '../types';
import { applyDefaultModelTransformation, createModelTransformation } from './modelTransformation';

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

  async getModelTransformation(_identifier: { fileName: string }): Promise<ModelTransformation> {
    const matrix = new THREE.Matrix4();
    applyDefaultModelTransformation(matrix, File3dFormat.RevealCadModel);
    return createModelTransformation(matrix);
  }
}
