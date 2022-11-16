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
import { DEFAULT_CLASSIFICATION, PointCloudMaterial } from '../../packages/rendering';
import { PointCloudObjectAppearanceTexture } from '../../packages/rendering/src/pointcloud-rendering/PointCloudObjectAppearanceTexture';

export function createPointCloudModel(modelId: number, revisionId: number): CognitePointCloudModel {
  const pointCloudNode = createPointCloudNode();

  return new CognitePointCloudModel(modelId, revisionId, pointCloudNode);
}

export function createPointCloudNode(): PointCloudNode {
  const potreeGroup = new PotreeGroupWrapper();

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
    new Mock<PointCloudMaterial>()
      .setup(p => p.classification)
      .returns(DEFAULT_CLASSIFICATION)
      .setup(p => p.objectAppearanceTexture)
      .returns(new PointCloudObjectAppearanceTexture(1, 1))
      .object()
  );

  const nodeWrapper = new PotreeNodeWrapper(Symbol('dummy'), pointCloudOctree, [], { classificationSets: [] });

  return new PointCloudNode(potreeGroup, nodeWrapper);
}
