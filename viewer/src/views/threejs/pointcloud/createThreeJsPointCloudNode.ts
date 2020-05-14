/*!
 * Copyright 2020 Cognite AS
 */

// @ts-ignore
import * as Potree from '@cognite/potree-core';

import { PointCloudModel } from '../../../dataModels/pointCloud';
import { toThreeMatrix4 } from '../utilities';
import { PotreeGroupWrapper } from './PotreeGroupWrapper';
import { PotreeNodeWrapper } from './PotreeNodeWrapper';

export async function createThreeJsPointCloudNode(
  model: PointCloudModel,
  potreeGroup?: Potree.Group
): Promise<[PotreeGroupWrapper, PotreeNodeWrapper]> {
  const [fetchPointcloud] = model;
  const [geometry, transform] = await fetchPointcloud();

  if (!potreeGroup) {
    potreeGroup = new PotreeGroupWrapper();
  }

  const octtree = new Potree.PointCloudOctree(geometry);
  octtree.name = 'PointCloudOctree';
  octtree.applyMatrix(toThreeMatrix4(transform.modelMatrix));
  const node = new PotreeNodeWrapper(octtree);
  potreeGroup.addPointCloud(node);

  return [potreeGroup, node];
}
