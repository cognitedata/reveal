/*!
 * Copyright 2020 Cognite AS
 */

import { HttpError } from '@cognite/sdk';
import { CadSceneProvider } from '@/dataModels/cad/internal/CadSceneProvider';
import { CadSectorProvider } from '@/dataModels/cad/internal/sector/CadSectorProvider';
import { EptSceneProvider } from '@/dataModels/pointCloud/internal/EptSceneProvider';
import { ModelUrlProvider } from './types';
import { HttpHeadersProvider } from './HttpHeadersProvider';

export class LocalUrlClient
  implements
    ModelUrlProvider<{ fileName: string }>,
    CadSceneProvider,
    CadSectorProvider,
    HttpHeadersProvider,
    EptSceneProvider {
  getModelUrl(params: { fileName: string }): Promise<string> {
    return Promise.resolve(`${location.origin}/${params.fileName}`);
  }

  get headers() {
    return {};
  }

  async getCadSectorFile(blobUrl: string, fileName: string): Promise<ArrayBuffer> {
    const response = await this.fetchWithStatusCheck(`${blobUrl}/${fileName}`);
    return response.arrayBuffer();
  }
  async getCadScene(blobUrl: string): Promise<any> {
    const response = await this.fetchWithStatusCheck(`${blobUrl}/scene.json`);
    return response.json();
  }

  async getEptScene(blobUrl: string): Promise<any> {
    const response = await this.fetchWithStatusCheck(`${blobUrl}/ept.json`);
    return response.json();
  }

  private async fetchWithStatusCheck(url: string): Promise<Response> {
    const response = await fetch(url);
    if (!response.ok) {
      const headers: { [key: string]: string } = {};
      response.headers.forEach((key, value) => {
        headers[key] = value;
      });
      throw new HttpError(response.status, response.body, headers);
    }
    return response;
  }
}
