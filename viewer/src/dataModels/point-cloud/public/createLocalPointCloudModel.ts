/*!
 * Copyright 2020 Cognite AS
 */

import { mat4 } from 'gl-matrix';
import { FetchPointCloudDelegate } from '../internal/delegates';
import { PointCloudLoader } from '../internal/potree/PointCloudLoader';
import { EptLoader } from '../internal/potree/EptLoader';
import { PointCloudModel } from './PointCloudModel';
import { SectorModelTransformation } from '@/experimental';

const identity = mat4.identity(mat4.create());

export async function createLocalPointCloudModel(url: string): Promise<PointCloudModel> {
  const fetchPointCloud: FetchPointCloudDelegate = async () => {
    const transform: SectorModelTransformation = {
      modelMatrix: identity,
      inverseModelMatrix: identity
    };

    if (url.endsWith('ept.json')) {
      // Entwine format
      return [await EptLoader.load(url), transform];
    } else {
      // Potree format
      return [await PointCloudLoader.load(url), transform];
    }
  };
  return [fetchPointCloud];
}
