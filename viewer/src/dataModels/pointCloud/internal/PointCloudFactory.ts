/*!
 * Copyright 2020 Cognite AS
 */
// @ts-ignore
import * as Potree from '@cognite/potree-core';
import { PointCloudMetadata } from '@/dataModels/pointCloud/public/PointCloudMetadata';
import { PotreeNodeWrapper } from './PotreeNodeWrapper';
import { toThreeMatrix4 } from '@/utilities/utilities';
import { HttpHeadersProvider } from '@/utilities/networking/HttpHeadersProvider';

export class PointCloudFactory {
  private readonly _httpHeadersProvider: HttpHeadersProvider;

  constructor(httpHeadersProvider: HttpHeadersProvider) {
    this._httpHeadersProvider = httpHeadersProvider;
  }

  createModel(modelMetadata: PointCloudMetadata): PotreeNodeWrapper {
    this.initializePointCloudXhrRequestHeaders();
    const { blobUrl, modelTransformation, scene } = modelMetadata;
    const geometry = new Potree.PointCloudEptGeometry(blobUrl + '/', scene);
    const x = geometry.offset.x;
    const y = geometry.offset.y;
    const z = geometry.offset.z;
    const root = new Potree.PointCloudEptGeometryNode(geometry, geometry.boundingBox, 0, x, y, z);
    geometry.root = root;
    geometry.root.load();

    const octtree = new Potree.PointCloudOctree(geometry);
    octtree.name = `PointCloudOctree: ${blobUrl}`;
    octtree.applyMatrix(toThreeMatrix4(modelTransformation.modelMatrix));
    const node = new PotreeNodeWrapper(octtree);
    return node;
  }

  private initializePointCloudXhrRequestHeaders() {
    const clientHeaders = this._httpHeadersProvider.headers;
    let xhrHeaders: { header: string; value: string }[] = Potree.XHRFactory.config.customHeaders;
    for (const [header, value] of Object.entries(clientHeaders)) {
      xhrHeaders = xhrHeaders.filter(x => x.header !== header);
      xhrHeaders.push({ header, value });
    }
    Potree.XHRFactory.config.customHeaders = xhrHeaders.filter(x => x.header);
  }
}
