/*!
 * Copyright 2021 Cognite AS
 */

import { PotreeNodeWrapper } from './PotreeNodeWrapper';
import { PointCloudMetadata } from './PointCloudMetadata';

import { HttpHeadersProvider } from '@reveal/modeldata-api';

import { PointCloudOctree, Potree, XHRFactoryInstance } from './potree-three-loader';

export class PointCloudFactory {
  private readonly _httpHeadersProvider: HttpHeadersProvider;
  private readonly _potreeInstance: Potree;

  constructor(httpHeadersProvider: HttpHeadersProvider) {
    this._httpHeadersProvider = httpHeadersProvider;
    this._potreeInstance = new Potree();
  }

  get potreeInstance(): Potree {
    return this._potreeInstance;
  }

  async createModel(modelMetadata: PointCloudMetadata): Promise<PotreeNodeWrapper> {
    this.initializePointCloudXhrRequestHeaders();
    const { modelBaseUrl } = modelMetadata;

    return this._potreeInstance
      .loadPointCloud('/ept.json', (url: string) => modelBaseUrl + url)
      .then((pco: PointCloudOctree) => {
        pco.name = `PointCloudOctree: ${modelBaseUrl}`;
        return new PotreeNodeWrapper(pco);
      });
  }

  private initializePointCloudXhrRequestHeaders() {
    const clientHeaders = this._httpHeadersProvider.headers;
    let xhrHeaders: { header: string; value: string }[] = XHRFactoryInstance.config.customHeaders;
    for (const [header, value] of Object.entries(clientHeaders)) {
      xhrHeaders = xhrHeaders.filter(x => x.header !== header);
      xhrHeaders.push({ header, value });
    }
    const filteredHeaders = xhrHeaders.filter(x => x.header);

    XHRFactoryInstance.config.customHeaders = filteredHeaders;
  }
}
