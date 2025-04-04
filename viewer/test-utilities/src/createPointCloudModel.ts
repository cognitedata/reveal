/*!
 * Copyright 2022 Cognite AS
 */

import { Mock } from 'moq.ts';
import { CognitePointCloudModel, PointCloudNode } from '../../packages/pointclouds';

import { Potree, PointCloudOctree } from '../../packages/pointclouds/src/potree-three-loader';

import * as THREE from 'three';

import { IPointCloudTreeGeometry } from '../../packages/pointclouds/src/potree-three-loader/geometry/IPointCloudTreeGeometry';
import { DEFAULT_CLASSIFICATION, PointCloudMaterial } from '../../packages/rendering';
import { PointCloudObjectAppearanceTexture } from '../../packages/rendering/src/pointcloud-rendering/PointCloudObjectAppearanceTexture';
import { DataSourceType } from '../../packages/data-providers/src/DataSourceType';

export function createPointCloudModel<T extends DataSourceType>(
  modelId: number,
  revisionId: number
): CognitePointCloudModel<T> {
  const pointCloudNode = createPointCloudNode<T>();

  return new CognitePointCloudModel<T>({ modelId, revisionId }, pointCloudNode);
}

export function createPointCloudNode<T extends DataSourceType>(): PointCloudNode<T> {
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

  return new PointCloudNode(Symbol(), new THREE.Matrix4(), pointCloudOctree, [], { classificationSets: [] });
}
