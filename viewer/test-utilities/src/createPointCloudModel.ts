/*!
 * Copyright 2022 Cognite AS
 */

import { Potree } from '../../packages/pointclouds/src/potree-three-loader/Potree';
import { PointCloudMaterial } from '../../packages//pointclouds/src/potree-three-loader/rendering/PointCloudMaterial';
import { PointCloudOctree } from '../../packages/pointclouds/src/potree-three-loader/tree/PointCloudOctree';

import {
  CognitePointCloudModel,
  PointCloudNode,
  PotreeNodeWrapper,
  PotreeGroupWrapper
} from '../../packages/pointclouds';

import { LocalModelDataProvider } from '../../packages/modeldata-api/src/LocalModelDataProvider';

import { Mock } from 'moq.ts';

export function createPointCloudModel(modelId: number, revisionId: number): CognitePointCloudModel {
  const modelDataProvider = new LocalModelDataProvider();
  const potreeInstance = new Potree(modelDataProvider);

  const potreeGroup = new PotreeGroupWrapper(potreeInstance);

  const dummyNode: PointCloudOctree = new Mock<PointCloudOctree>()
    .setup(p => p.isObject3D)
    .returns(true)
    .setup(p => p.parent)
    .returns(null)
    .setup(p => p.dispatchEvent.bind(p))
    .returns((_: any) => {})
    .setup(p => p.material)
    .returns(new PointCloudMaterial())
    .object();

  const nodeWrapper = new PotreeNodeWrapper(dummyNode, []);

  const pointCloudNode = new PointCloudNode(potreeGroup, nodeWrapper);

  const pointCloudModel = new CognitePointCloudModel(modelId, revisionId, pointCloudNode);

  return pointCloudModel;
}
