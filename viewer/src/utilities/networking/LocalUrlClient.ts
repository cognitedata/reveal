/*!
 * Copyright 2020 Cognite AS
 */

import { HttpError } from '@cognite/sdk';
import { HttpHeadersProvider } from './HttpHeadersProvider';
import { ModelUrlProvider } from './types';
import { CadSceneProvider } from '@/datamodels/cad/CadSceneProvider';
import { CadSectorProvider } from '@/datamodels/cad/sector/CadSectorProvider';
import { EptSceneProvider } from '@/datamodels/pointcloud/EptSceneProvider';

export class LocalUrlClient
  implements ModelUrlProvider<string>, CadSceneProvider, CadSectorProvider, HttpHeadersProvider, EptSceneProvider {
  getModelUrl(fileName: string): Promise<string> {
    return Promise.resolve(`${location.origin}/${fileName}`);
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
