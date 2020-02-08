/*!
 * Copyright 2020 Cognite AS
 */

import { mat4 } from 'gl-matrix';
import { FetchPointCloudDelegate } from '../../../models/pointclouds/delegates';
import { SectorModelTransformation } from '../../../models/cad/types';
import { EptLoader } from '../../../utils/potree/EptLoader';
import { PointCloudModel } from '../../../models/pointclouds/PointCloudModel';
import { CogniteClient } from '@cognite/sdk';
import { CogniteClient3dV2Extensions } from '../../../utils/CogniteClient3dV2Extensions';
// @ts-ignore
import * as Potree from '@cognite/potree-core';

const identity = mat4.identity(mat4.create());

export function createPointCloudModel(sdk: CogniteClient, modelRevisionId: number): PointCloudModel {
  const sdkExtensions = new CogniteClient3dV2Extensions(sdk);
  let xhrHeaders: { header: string; value: string }[] = Potree.XHRFactory.config.customHeaders;

  Potree.XHRFactory.config.withCredentials = true;
  for (const [header, value] of Object.entries(sdkExtensions.defaultHeaders)) {
    xhrHeaders = xhrHeaders.filter(x => x.header !== header);
    xhrHeaders.push({ header, value });
  }
  Potree.XHRFactory.config.customHeaders = xhrHeaders.filter(x => x.header);

  const outputsPromise = sdkExtensions.getOutputs(modelRevisionId);

  const fetchPointCloud: FetchPointCloudDelegate = async () => {
    const outputs = await outputsPromise;
    const eptOutput = outputs.find(x => x.outputType === 'ept');
    if (!eptOutput || eptOutput.versions.length === 0) {
      throw new Error(`No point cloud output found for model ${modelRevisionId}`);
    }
    const mostReventEptOutput = eptOutput.versions[eptOutput.versions.length - 1];
    const url =
      'https://api.cognitedata.com' + sdkExtensions.buildBlobBaseUrl(mostReventEptOutput.blobs.ept) + '/ept.json';

    const transform: SectorModelTransformation = {
      modelMatrix: identity,
      inverseModelMatrix: identity
    };
    return [await EptLoader.load(url), transform];
  };
  return [fetchPointCloud];
}
