/*!
 * Copyright 2022 Cognite AS
 */

import { Mock } from 'moq.ts';
import {
  CognitePointCloudModel,
  PointCloudNode,
  PointCloudObjectAnnotationData,
  PointCloudOctree,
  Potree,
  PotreeGroupWrapper,
  PotreeNodeWrapper
} from '../../packages/pointclouds';

import * as THREE from 'three';

import { LocalModelDataProvider } from '../../packages/data-providers';
import { IPointCloudTreeGeometry } from '../../packages/pointclouds/src/potree-three-loader/geometry/IPointCloudTreeGeometry';

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

  const nodeWrapper = new PotreeNodeWrapper(dummyNode, [], Symbol('dummy'), { classificationSets: [] });

  const pointCloudNode = new PointCloudNode(potreeGroup, nodeWrapper);

  const pointCloudModel = new CognitePointCloudModel(modelId, revisionId, pointCloudNode);

  return pointCloudModel;
}
