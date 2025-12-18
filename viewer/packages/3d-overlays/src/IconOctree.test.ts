/*!
 * Copyright 2023 Cognite AS
 */

import { Mock } from 'moq.ts';
import { Box3, Matrix4, Vector3 } from 'three';
import { Overlay3DIcon } from './Overlay3DIcon';
import { IconOctree } from './IconOctree';

describe(IconOctree.name, () => {
  let unitBounds: Box3;

  beforeAll(() => {
    unitBounds = new Box3(new Vector3(), new Vector3(1, 1, 1));
  });

  test("Empty icon octree doesn't throw on LOD by screen area query", () => {
    const octree = new IconOctree([], unitBounds, 8);
    expect(() => octree.getLODByScreenArea(0.4, new Matrix4().makePerspective(-1, 1, -1, 1, 0.1, 1))).not.toThrow();
  });

  test('Icon octree with single points should only contain root', () => {
    const image360IconMock = new Mock<Overlay3DIcon>()
      .setup(icon => icon.getPosition())
      .returns(new Vector3(0.25, 0.25, 0.25))
      .object();
    const octree = new IconOctree([image360IconMock], unitBounds, 8);

    expect(octree.getDepth()).toBe(0);
  });

  test('Icon octree with two points and max leaf size one should have depth 1', () => {
    const image360IconMock1 = new Mock<Overlay3DIcon>()
      .setup(icon => icon.getPosition())
      .returns(new Vector3(0.25, 0.25, 0.25))
      .object();

    const image360IconMock2 = new Mock<Overlay3DIcon>()
      .setup(icon => icon.getPosition())
      .returns(new Vector3(0.75, 0.75, 0.75))
      .object();

    const octree = new IconOctree([image360IconMock1, image360IconMock2], unitBounds, 1);

    expect(octree.getDepth()).toBe(1);
  });

  test('Icon octree with two points and max leaf size 1 should only have 2 leaf nodes at max depth', () => {
    const image360IconMock1 = new Mock<Overlay3DIcon>()
      .setup(icon => icon.getPosition())
      .returns(new Vector3(0.25, 0.25, 0.25))
      .object();

    const image360IconMock2 = new Mock<Overlay3DIcon>()
      .setup(icon => icon.getPosition())
      .returns(new Vector3(0.75, 0.75, 0.75))
      .object();

    const octree = new IconOctree([image360IconMock1, image360IconMock2], unitBounds, 1);

    expect(octree.getDepth()).toBe(1);

    expect(octree.findNodesByLevel(1).length).toBe(2);
  });

  test('Root node should have a center as the closest of its children', () => {
    const image360IconMock1 = new Mock<Overlay3DIcon>()
      .setup(icon => icon.getPosition())
      .returns(new Vector3(0.25, 0.25, 0.25))
      .object();

    const image360IconMock2 = new Mock<Overlay3DIcon>()
      .setup(icon => icon.getPosition())
      .returns(new Vector3(0.8, 0.8, 0.8))
      .object();

    const octree = new IconOctree([image360IconMock1, image360IconMock2], unitBounds, 1);

    expect(JSON.stringify(octree.getNodeIcon(octree.findNodesByLevel(0)[0])!.getPosition())).toBe(
      JSON.stringify(new Vector3(0.25, 0.25, 0.25))
    );
  });

  test('getting LODs with threshold 0.05 should return both leaf nodes', () => {
    const image360IconMock1 = new Mock<Overlay3DIcon>()
      .setup(icon => icon.getPosition())
      .returns(new Vector3(0.25, 0.25, 0.25))
      .object();

    const image360IconMock2 = new Mock<Overlay3DIcon>()
      .setup(icon => icon.getPosition())
      .returns(new Vector3(0.75, 0.75, 0.75))
      .object();

    const octree = new IconOctree([image360IconMock1, image360IconMock2], unitBounds, 1);

    const unitOrthographicProjection = new Matrix4().makeOrthographic(1, -1, 1, -1, -1, 1);
    const set = octree.getLODByScreenArea(0.05, unitOrthographicProjection);

    expect(set.size).toBe(2);

    const lods = [...set];

    expect(lods.filter(p => p.data?.data.includes(image360IconMock1)).length).toBe(1);
    expect(lods.filter(p => p.data?.data.includes(image360IconMock2)).length).toBe(1);
  });

  describe('getLODByDistance', () => {
    const mockCameraPosition1 = new Vector3(0.5, 0.5, 0.5);
    const mockCameraPosition2 = new Vector3(0, 0, 0);

    // Create multiple icons spread across the bounds
    const positions = [
      new Vector3(0.25, 0.25, 0.25),
      new Vector3(0.75, 0.75, 0.75),
      new Vector3(0.5, 0.5, 0.5),
      new Vector3(0.1, 0.1, 0.1),
      new Vector3(0.9, 0.9, 0.9),
      new Vector3(0.15, 0.15, 0.15)
    ];

    const iconMocks = positions.map(pos =>
      new Mock<Overlay3DIcon>()
        .setup(icon => icon.getPosition())
        .returns(pos)
        .object()
    );
    test('Empty octree returns empty set', () => {
      const octree = new IconOctree([], unitBounds, 8);
      const result = octree.getLODByDistance(mockCameraPosition1, 10);
      expect(result.size).toBe(0);
    });

    test('Single icon returns one node', () => {
      const octree = new IconOctree([iconMocks[0]], unitBounds, 8);
      const result = octree.getLODByDistance(mockCameraPosition2, 10);

      expect(result.size).toBe(1);
    });

    test('All icons returned when camera position is undefined (no clustering)', () => {
      const octree = new IconOctree([iconMocks[0], iconMocks[1]], unitBounds, 1);
      const result = octree.getLODByDistance(undefined, 10);

      expect(result.size).toBe(2);

      const lods = [...result];
      expect(lods.filter(p => p.data?.data.includes(iconMocks[0])).length).toBe(1);
      expect(lods.filter(p => p.data?.data.includes(iconMocks[1])).length).toBe(1);
    });

    test('Icons within distance threshold are all returned individually', () => {
      const octree = new IconOctree([iconMocks[0], iconMocks[1]], unitBounds, 1);

      const cameraPosition = new Vector3(0.5, 0.5, 0.5);
      const result = octree.getLODByDistance(cameraPosition, 1);

      expect(result.size).toBe(2);

      const lods = [...result];
      expect(lods.filter(p => p.data?.data.includes(iconMocks[0])).length).toBe(1);
      expect(lods.filter(p => p.data?.data.includes(iconMocks[1])).length).toBe(1);
    });

    test('Icons beyond distance threshold are clustered', () => {
      const octree = new IconOctree([iconMocks[0], iconMocks[1]], unitBounds, 1);

      const cameraPosition = new Vector3(10, 10, 10);
      const result = octree.getLODByDistance(cameraPosition, 0.01, 0);

      expect(result.size).toBeLessThanOrEqual(2);
    });

    test('Camera close to some icons shows them individually while clustering distant ones', () => {
      const octree = new IconOctree([iconMocks[0], iconMocks[1], iconMocks[4]], unitBounds, 1);

      const cameraPosition = new Vector3(0.1, 0.1, 0.1);
      const result = octree.getLODByDistance(cameraPosition, 0.2, 1);

      const lods = [...result];
      const closeIconNode = lods.find(node => node.data?.data.includes(iconMocks[0]));
      expect(closeIconNode).toBeDefined();
    });

    test('Moving camera changes which icons are clustered', () => {
      const octree = new IconOctree([iconMocks[3], iconMocks[4]], unitBounds, 1);

      const cameraPosition1 = new Vector3(0.1, 0.1, 0.1);
      const cameraPosition2 = new Vector3(0.9, 0.9, 0.9);
      const resultNearIcon1 = octree.getLODByDistance(cameraPosition1, 0.2, 0);

      const resultNearIcon2 = octree.getLODByDistance(cameraPosition2, 0.2, 0);

      expect(resultNearIcon1.size).toBeGreaterThan(0);
      expect(resultNearIcon2.size).toBeGreaterThan(0);
    });

    test('Zero distance threshold clusters all icons', () => {
      const octree = new IconOctree([iconMocks[0], iconMocks[1]], unitBounds, 1);

      const cameraPosition = new Vector3(0.5, 0.5, 0.5);
      const result = octree.getLODByDistance(cameraPosition, 0, 0);

      expect(result.size).toBeGreaterThan(0);
    });

    test('Very large distance threshold shows all icons individually', () => {
      const octree = new IconOctree(iconMocks, unitBounds, 1);

      const cameraPosition = new Vector3(0.5, 0.5, 0.5);
      const result = octree.getLODByDistance(cameraPosition, 1000);

      expect(result.size).toBe(iconMocks.length);
    });
  });
});
