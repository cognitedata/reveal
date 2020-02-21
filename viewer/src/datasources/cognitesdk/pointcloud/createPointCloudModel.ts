/*!
 * Copyright 2020 Cognite AS
 */

import { mat4 } from 'gl-matrix';
import { FetchPointCloudDelegate } from '../../../models/pointclouds/delegates';
import { SectorModelTransformation } from '../../../models/cad/types';
import { EptLoader } from '../../../utils/potree/EptLoader';
import { PointCloudModel } from '../../../models/pointclouds/PointCloudModel';
import { CogniteClient } from '@cognite/sdk';
import {
  CogniteClient3dV2Extensions,
  CogniteWellknown3dFormat,
  CogniteUniformId
} from '../../../utils/CogniteClient3dV2Extensions';
// @ts-ignore
import * as Potree from '@cognite/potree-core';

const identity = mat4.identity(mat4.create());

export async function createPointCloudModel(
  sdk: CogniteClient,
  modelRevisionId: CogniteUniformId
): Promise<PointCloudModel> {
  initializeXHRRequestHeaders(sdk);
  const baseUrl = sdk.getBaseUrl();

  const sdkExtensions = new CogniteClient3dV2Extensions(sdk);
  const outputs = await sdkExtensions.getOutputs(modelRevisionId, [CogniteWellknown3dFormat.EptPointCloud]);
  const mostRecentEptOutput = outputs.findMostRecentOutput(CogniteWellknown3dFormat.EptPointCloud);
  if (!mostRecentEptOutput) {
    throw new Error(`No point cloud output found for model ${modelRevisionId}`);
  }
  const url = baseUrl + sdkExtensions.buildBlobBaseUrl(mostRecentEptOutput.blobId) + '/ept.json';
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

function initializeXHRRequestHeaders(sdk: CogniteClient) {
  const sdkHeaders = sdk.getDefaultRequestHeaders();
  let xhrHeaders: { header: string; value: string }[] = Potree.XHRFactory.config.customHeaders;
  for (const [header, value] of Object.entries(sdkHeaders)) {
    xhrHeaders = xhrHeaders.filter(x => x.header !== header);
    xhrHeaders.push({ header, value });
  }
  Potree.XHRFactory.config.customHeaders = xhrHeaders.filter(x => x.header);
}
