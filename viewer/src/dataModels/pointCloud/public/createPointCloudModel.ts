/*!
 * Copyright 2020 Cognite AS
 */

import { mat4 } from 'gl-matrix';
import { FetchPointCloudDelegate } from '../internal/delegates';
import { SectorModelTransformation } from '../../cad/internal/sector/types';
import { EptLoader } from '../internal/potree/EptLoader';
import { PointCloudModel } from './PointCloudModel';
import { CogniteClient, IdEither } from '@cognite/sdk';
import { CogniteClient3dExtensions } from '../../../utilities/networking/CogniteClient3dExtensions';
// @ts-ignore
import * as Potree from '@cognite/potree-core';
import { File3dFormat } from '../../../utilities/File3dFormat';

const identity = mat4.identity(mat4.create());

export async function createPointCloudModel(
  client: CogniteClient,
  modelRevisionId: IdEither
): Promise<PointCloudModel> {
  initializeXhrRequestHeaders(client);
  const baseUrl = client.getBaseUrl();

  const clientExtensions = new CogniteClient3dExtensions(client);
  const blobUrl = await clientExtensions.getModelUrl(modelRevisionId, File3dFormat.EptPointCloud);
  const url = baseUrl + blobUrl + '/ept.json';
  const loaderPromise = EptLoader.load(url);

  const fetchPointCloud: FetchPointCloudDelegate = async () => {
    const transform: SectorModelTransformation = {
      modelMatrix: identity,
      inverseModelMatrix: identity
    };
    return [await loaderPromise, transform];
  };
  return [fetchPointCloud];
}

function initializeXhrRequestHeaders(client: CogniteClient) {
  const clientHeaders = client.getDefaultRequestHeaders();
  let xhrHeaders: { header: string; value: string }[] = Potree.XHRFactory.config.customHeaders;
  for (const [header, value] of Object.entries(clientHeaders)) {
    xhrHeaders = xhrHeaders.filter(x => x.header !== header);
    xhrHeaders.push({ header, value });
  }
  Potree.XHRFactory.config.customHeaders = xhrHeaders.filter(x => x.header);
}
