/*!
 * Copyright 2023 Cognite AS
 */

import { Mock } from 'moq.ts';
import { Box3, Matrix4, Vector3 } from 'three';
import { Image360Icon } from '../icons/Image360Icon';
import { IconOctree } from './IconOctree';

describe(IconOctree.name, () => {
  let unitBounds: Box3;

  beforeAll(() => {
    unitBounds = new Box3(new Vector3(), new Vector3(1, 1, 1));
  });

  test('Icon octree with single points should only contain root', () => {
    const image360IconMock = new Mock<Image360Icon>()
      .setup(icon => icon.position)
      .returns(new Vector3(0.25, 0.25, 0.25))
      .object();
    const octree = new IconOctree([image360IconMock], unitBounds, 8);

    expect(octree.getDepth()).toBe(0);
  });

  test('Icon octree with two points and max leaf size one should have depth 1', () => {
    const image360IconMock1 = new Mock<Image360Icon>()
      .setup(icon => icon.position)
      .returns(new Vector3(0.25, 0.25, 0.25))
      .object();

    const image360IconMock2 = new Mock<Image360Icon>()
      .setup(icon => icon.position)
      .returns(new Vector3(0.75, 0.75, 0.75))
      .object();

    const octree = new IconOctree([image360IconMock1, image360IconMock2], unitBounds, 1);

    expect(octree.getDepth()).toBe(1);
  });

  test('Icon octree with two points and max leaf size 1 should only have 2 leaf nodes at max depth', () => {
    const image360IconMock1 = new Mock<Image360Icon>()
      .setup(icon => icon.position)
      .returns(new Vector3(0.25, 0.25, 0.25))
      .object();

    const image360IconMock2 = new Mock<Image360Icon>()
      .setup(icon => icon.position)
      .returns(new Vector3(0.75, 0.75, 0.75))
      .object();

    const octree = new IconOctree([image360IconMock1, image360IconMock2], unitBounds, 1);

    expect(octree.getDepth()).toBe(1);

    expect(octree.findNodesByLevel(1).length).toBe(2);
  });

  test('Root node should have a center as an average of its children', () => {
    const image360IconMock1 = new Mock<Image360Icon>()
      .setup(icon => icon.position)
      .returns(new Vector3(0.25, 0.25, 0.25))
      .object();

    const image360IconMock2 = new Mock<Image360Icon>()
      .setup(icon => icon.position)
      .returns(new Vector3(0.75, 0.75, 0.75))
      .object();

    const octree = new IconOctree([image360IconMock1, image360IconMock2], unitBounds, 1);

    expect(JSON.stringify(octree.getPointCenterOfNode(octree.findNodesByLevel(0)[0]))).toBe(
      JSON.stringify(new Vector3(0.5, 0.5, 0.5))
    );
  });

  test('getting LODs with threshold 0.05 should return both leaf nodes', () => {
    const image360IconMock1 = new Mock<Image360Icon>()
      .setup(icon => icon.position)
      .returns(new Vector3(0.25, 0.25, 0.25))
      .object();

    const image360IconMock2 = new Mock<Image360Icon>()
      .setup(icon => icon.position)
      .returns(new Vector3(0.75, 0.75, 0.75))
      .object();

    const octree = new IconOctree([image360IconMock1, image360IconMock2], unitBounds, 1);

    const unitOrthographicProjection = new Matrix4().makeOrthographic(1, -1, 1, -1, -1, 1);
    const set = octree.getLODByScreenArea(0.05, unitOrthographicProjection);

    expect(set.size).toBe(2);

    const lods = [...set];

    expect(lods.filter(p => p.data.data.includes(image360IconMock1)).length).toBe(1);
    expect(lods.filter(p => p.data.data.includes(image360IconMock2)).length).toBe(1);
  });
});
