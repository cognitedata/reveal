/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudNode } from './PointCloudNode';
import { createPointCloudNode } from '../../../test-utilities';

import * as THREE from 'three';
import { PointCloudOctree, PointCloudOctreeNode } from './potree-three-loader';
import { Mock } from 'moq.ts';
import { IPointCloudTreeGeometryNode } from './potree-three-loader/geometry/IPointCloudTreeGeometryNode';
import jest from 'jest-mock';
import { DEFAULT_CLASSIFICATION, PointCloudMaterial } from '../../rendering';
import { PointCloudObjectAppearanceTexture } from '../../rendering/src/pointcloud-rendering';

describe(PointCloudNode.name, () => {
  test('getModelTransformation returns transformation set by setModelTransformation', () => {
    const node = createPointCloudNode();
    const transform = new THREE.Matrix4()
      .makeRotationFromEuler(new THREE.Euler(190, 35, 230))
      .setPosition(new THREE.Vector3(12, 34, 12));

    node.setModelTransformation(transform.clone());
    const receivedTransform = node.getModelTransformation();

    expect(receivedTransform).toEqual(transform);
  });

  describe('getSubtreePointsByBox', () => {
    test('returns empty array when octree root is undefined', () => {
      const node = createPointCloudNode();

      Object.defineProperty(node.octree, 'root', {
        get: jest.fn().mockReturnValue(undefined)
      });

      const box = new THREE.Box3(new THREE.Vector3(-10, -10, -10), new THREE.Vector3(10, 10, 10));

      const result = node.getSubtreePointsByBox(box);

      expect(result).toEqual([]);
    });

    test('returns points that are inside the given box', () => {
      const pointCloudOctree = new Mock<PointCloudOctree>()
        .setup(p => p.material)
        .returns(
          new Mock<PointCloudMaterial>()
            .setup(p => p.classification)
            .returns(DEFAULT_CLASSIFICATION)
            .setup(p => p.objectAppearanceTexture)
            .returns(new PointCloudObjectAppearanceTexture(1, 1))
            .object()
        )
        .setup(p => p.root)
        .returns(
          new PointCloudOctreeNode(
            new Mock<IPointCloudTreeGeometryNode>()
              .setup(p => p.children)
              .returns([])
              .setup(p => p.boundingBox)
              .returns(new THREE.Box3(new THREE.Vector3(1, 1, 1), new THREE.Vector3(15, 15, 15)))
              .object(),
            new THREE.Points(
              new THREE.BufferGeometry().setAttribute(
                'position',
                new THREE.BufferAttribute(new Float32Array([1, 1, 1, 15, 15, 15, 5, 5, 5]), 3)
              )
            )
          )
        )
        .object();

      const sourceMatrix = new THREE.Matrix4().identity();
      const node = new PointCloudNode(Symbol(), sourceMatrix, pointCloudOctree, [], { classificationSets: [] });

      const box = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 10, 10));

      const result = node.getSubtreePointsByBox(box);

      expect(result.length).toBe(2);
      expect(result[0].equals(new THREE.Vector3(1, 1, 1))).toBeTruthy();
      expect(result[1].equals(new THREE.Vector3(5, 5, 5))).toBeTruthy();
    });
  });
});
