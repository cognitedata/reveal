/*!
 * Copyright 2026 Cognite AS
 */
import { BufferGeometry, Points } from 'three';
import { PointCloudOctreeNode } from './PointCloudOctreeNode';
import type { IPointCloudTreeGeometryNode } from '../geometry/IPointCloudTreeGeometryNode';
import { Mock } from 'moq.ts';

describe(PointCloudOctreeNode.name, () => {
  test('keepFraction defaults to 1', () => {
    const geometryNode = new Mock<IPointCloudTreeGeometryNode>()
      .setup(g => g.children)
      .returns([])
      .object();
    const sceneNode = new Points(new BufferGeometry());

    const node = new PointCloudOctreeNode(geometryNode, sceneNode);

    expect(node.keepFraction).toBe(1);
  });

  test('keepFraction can be lowered to dither the node in', () => {
    const geometryNode = new Mock<IPointCloudTreeGeometryNode>()
      .setup(g => g.children)
      .returns([])
      .object();
    const sceneNode = new Points(new BufferGeometry());

    const node = new PointCloudOctreeNode(geometryNode, sceneNode);
    node.keepFraction = 0.4;

    expect(node.keepFraction).toBe(0.4);
  });
});
