/*!
 * Copyright 2022 Cognite AS
 */

import { Mock } from 'moq.ts';
import {
  CognitePointCloudModel,
  PointCloudNode,
  PointCloudOctree,
  Potree,
  PotreeGroupWrapper,
  PotreeNodeWrapper
} from '../../packages/pointclouds';

import * as THREE from 'three';

import { IPointCloudTreeGeometry } from '../../packages/pointclouds/src/potree-three-loader/geometry/IPointCloudTreeGeometry';
import { PointCloudMaterial } from '../../packages/rendering';

export function createPointCloudModel(modelId: number, revisionId: number): CognitePointCloudModel {
  const pointCloudOctree = new PointCloudOctree(
    new Mock<Potree>().object(),
    new Mock<IPointCloudTreeGeometry>()
      .setup(p => p.boundingBox)
      .returns(new THREE.Box3())
      .setup(p => p.offset)
      .returns(new THREE.Vector3())
      .setup(p => p.tightBoundingBox)
      .returns(new THREE.Box3())
      .object(),
    new Mock<PointCloudMaterial>().object()
  );

  const groupWrapperMock = new Mock<PotreeGroupWrapper>();
  const nodeWrapperMock = new Mock<PotreeNodeWrapper>().setup(p => p.octree).returns(pointCloudOctree);

  const pointCloudNode = new PointCloudNode(groupWrapperMock.object(), nodeWrapperMock.object(), undefined);
  const model = new CognitePointCloudModel(modelId, revisionId, pointCloudNode);

  return model;
}
