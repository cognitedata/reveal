/*!
 * Copyright 2019 Cognite AS
 */

import { mat4 } from 'gl-matrix';
import { PointCloudModel } from '../../PointCloudModel';
import { FetchPointCloudDelegate } from '../../../models/pointclouds/delegates';
import { SectorModelTransformation } from '../../../models/sector/types';
import { PointCloudLoader } from '../../../utils/potree/PointCloudLoader';

const identity = mat4.identity(mat4.create());

export function createLocalPointCloudModel(url: string): PointCloudModel {
  const fetchPointCloud: FetchPointCloudDelegate = async () => {
    const transform: SectorModelTransformation = {
      modelMatrix: identity,
      inverseModelMatrix: mat4.invert(mat4.create(), identity)!
    };
    return [await PointCloudLoader.load(url), transform];
  };
  return [fetchPointCloud];
}
