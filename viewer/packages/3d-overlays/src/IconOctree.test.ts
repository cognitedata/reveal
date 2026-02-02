/*!
 * Copyright 2023 Cognite AS
 */

import { Mock } from 'moq.ts';
import { Box3, Matrix4, Vector3 } from 'three';
import { Overlay3DIcon } from './Overlay3DIcon';
import { IconOctree } from './IconOctree';

describe(IconOctree.name, () => {
  let unitBounds: Box3;

  // Shared positions and icon mocks for all tests
  const positions = [
    new Vector3(0.25, 0.25, 0.25),
    new Vector3(0.75, 0.75, 0.75),
    new Vector3(0.5, 0.5, 0.5),
    new Vector3(0.1, 0.1, 0.1),
    new Vector3(0.9, 0.9, 0.9),
    new Vector3(0.15, 0.15, 0.15),
    new Vector3(0, 0, 0),
    new Vector3(1, 0, 0),
    new Vector3(0.8, 0.8, 0.8)
  ];

  const iconMocks = positions.map(pos =>
    new Mock<Overlay3DIcon>()
      .setup(icon => icon.getPosition())
      .returns(pos)
      .object()
  );

  beforeAll(() => {
    unitBounds = new Box3(new Vector3(), new Vector3(1, 1, 1));
  });

  test("Empty icon octree doesn't throw on LOD by screen area query", () => {
    const octree = new IconOctree([], unitBounds, 8);
    expect(() => octree.getLODByScreenArea(0.4, new Matrix4().makePerspective(-1, 1, -1, 1, 0.1, 1))).not.toThrow();
  });

  test('Icon octree with single points should only contain root', () => {
    const octree = new IconOctree([iconMocks[0]], unitBounds, 8);
    expect(octree.getDepth()).toBe(0);
  });

  test('Icon octree with two points and max leaf size one should have depth 1', () => {
    const octree = new IconOctree([iconMocks[0], iconMocks[1]], unitBounds, 1);
    expect(octree.getDepth()).toBe(1);
  });

  test('Icon octree with two points and max leaf size 1 should only have 2 leaf nodes at max depth', () => {
    const octree = new IconOctree([iconMocks[0], iconMocks[1]], unitBounds, 1);
    expect(octree.getDepth()).toBe(1);
    expect(octree.findNodesByLevel(1).length).toBe(2);
  });

  test('Root node should have a center as the closest of its children', () => {
    const octree = new IconOctree([iconMocks[0], iconMocks[8]], unitBounds, 1);
    expect(JSON.stringify(octree.getNodeIcon(octree.findNodesByLevel(0)[0])!.getPosition())).toBe(
      JSON.stringify(positions[0])
    );
  });

  test('getting LODs with threshold 0.05 should return both leaf nodes', () => {
    const octree = new IconOctree([iconMocks[0], iconMocks[1]], unitBounds, 1);
    const unitOrthographicProjection = new Matrix4().makeOrthographic(1, -1, 1, -1, -1, 1);
    const set = octree.getLODByScreenArea(0.05, unitOrthographicProjection);

    expect(set.size).toBe(2);
    const lods = [...set];
    expect(lods.filter(p => p.data?.data.includes(iconMocks[0])).length).toBe(1);
    expect(lods.filter(p => p.data?.data.includes(iconMocks[1])).length).toBe(1);
  });

  describe('getLODByDistance', () => {
    test('Empty octree returns empty set', () => {
      const octree = new IconOctree([], unitBounds, 8);
      expect(octree.getLODByDistance(positions[2], 10).size).toBe(0);
    });

    test('Single icon returns one node', () => {
      const testIcons = [iconMocks[0]];
      const octree = new IconOctree(testIcons, unitBounds, 8);
      expect(octree.getLODByDistance(positions[6], 10).size).toBe(testIcons.length);
    });

    test('All icons returned when camera position is undefined (no clustering)', () => {
      const testIcons = [iconMocks[0], iconMocks[1]];
      const octree = new IconOctree(testIcons, unitBounds, 1);
      const result = octree.getLODByDistance(undefined, 10);
      expect(result.size).toBe(testIcons.length);
    });

    test('Icons within distance threshold are all returned individually', () => {
      const testIcons = [iconMocks[0], iconMocks[1]];
      const octree = new IconOctree(testIcons, unitBounds, 1);
      const result = octree.getLODByDistance(positions[2], 1);
      expect(result.size).toBe(testIcons.length);
    });

    test('Icons beyond distance threshold are clustered', () => {
      // Use 6 icons spread across the bounds
      const testIcons = iconMocks.slice(0, 6);
      const octree = new IconOctree(testIcons, unitBounds, 1);

      // Camera far from all icons - should cluster them into fewer nodes than total icons
      const farResult = octree.getLODByDistance(new Vector3(10, 10, 10), 0.3);
      expect(farResult.size).toBeLessThan(testIcons.length);

      // Camera close to icons at 0.1 position - those should not be clustered
      const closeResult = octree.getLODByDistance(positions[3], 2);
      expect(closeResult.size).toBe(testIcons.length);
    });

    test('Moving camera changes which icons are clustered', () => {
      const octree = new IconOctree([iconMocks[3], iconMocks[4]], unitBounds, 1);
      expect(octree.getLODByDistance(positions[3], 0.2).size).toBeGreaterThan(0);
      expect(octree.getLODByDistance(positions[4], 0.2).size).toBeGreaterThan(0);
    });

    test('Small distance threshold with far camera clusters icons', () => {
      const octree = new IconOctree([iconMocks[0], iconMocks[1]], unitBounds, 1);
      expect(octree.getLODByDistance(positions[2], 0).size).toBeGreaterThan(0);
      const result = octree.getLODByDistance(new Vector3(5, 5, 5), 0);
      expect(result.size).toBeGreaterThan(0);
      expect(result.size).toBeLessThanOrEqual(2);
    });

    test('Very large distance threshold shows all icons individually', () => {
      const testIcons = iconMocks.slice(0, 6);
      const octree = new IconOctree(testIcons, unitBounds, 1);
      expect(octree.getLODByDistance(positions[2], 1000).size).toBe(testIcons.length);
    });
  });

  describe('getAllIconsFromNode', () => {
    test('Returns empty array for empty octree and single icon for leaf node', () => {
      const emptyOctree = new IconOctree([], unitBounds, 8);
      expect(emptyOctree.getAllIconsFromNode(emptyOctree.findNodesByLevel(0)[0])).toEqual([]);

      const singleOctree = new IconOctree([iconMocks[0]], unitBounds, 8);
      const singleResult = singleOctree.getAllIconsFromNode(singleOctree.findNodesByLevel(0)[0]);
      expect(singleResult.length).toBe(1);
      expect(singleResult).toContain(iconMocks[0]);
    });

    test('Returns all icons recursively from root and only subtree icons from leaf nodes', () => {
      const testIcons = [iconMocks[3], iconMocks[5], iconMocks[4], iconMocks[1]];
      const octree = new IconOctree(testIcons, unitBounds, 1);
      const root = octree.findNodesByLevel(0)[0];

      const allIcons = octree.getAllIconsFromNode(root);
      testIcons.forEach(mock => expect(allIcons).toContain(mock));

      const leafNodes = octree.findNodesByLevel(octree.getDepth());
      leafNodes.forEach(leaf => {
        const leafIcons = octree.getAllIconsFromNode(leaf);
        expect(leafIcons.length).toBeGreaterThanOrEqual(1);
        expect(leafIcons.length).toBeLessThan(testIcons.length);
      });
    });
  });

  describe('hasDescendantInSet', () => {
    test('Returns true when node itself or any descendant is in set', () => {
      const testIcons = [iconMocks[3], iconMocks[5], iconMocks[4], iconMocks[1]];
      const octree = new IconOctree(testIcons, unitBounds, 1);
      const root = octree.findNodesByLevel(0)[0];
      const deepNodes = octree.findNodesByLevel(octree.getDepth());

      expect(octree.hasDescendantInSet(root, new Set([root]))).toBe(true);
      expect(octree.hasDescendantInSet(root, new Set([deepNodes[0]]))).toBe(true);
    });

    test('Returns false when node and descendants are not in set', () => {
      const testIcons = [iconMocks[3], iconMocks[5], iconMocks[4], iconMocks[1]];
      const octree = new IconOctree(testIcons, unitBounds, 1);
      const root = octree.findNodesByLevel(0)[0];
      const leafNodes = octree.findNodesByLevel(octree.getDepth());

      expect(octree.hasDescendantInSet(root, new Set())).toBe(false);
      expect(octree.hasDescendantInSet(leafNodes[0], new Set([leafNodes[1]]))).toBe(false);
    });
  });

  describe('getIconsFromClusteredNode', () => {
    test('Returns close icons when within threshold, or representative when none are close', () => {
      const octree = new IconOctree([iconMocks[3], iconMocks[4]], unitBounds, 2); // 0.1 and 0.9
      const root = octree.findNodesByLevel(0)[0];

      // Close icon within threshold - returns close icons
      const resultWithClose = octree.getIconsFromClusteredNode(root, positions[6], 0.3);
      expect(resultWithClose).toContain(iconMocks[3]);
      expect(resultWithClose).not.toContain(iconMocks[4]);

      // No icons within threshold - returns representative icon
      const resultNoClose = octree.getIconsFromClusteredNode(root, positions[6], 0.01);
      expect(resultNoClose.length).toBe(1);
      expect(resultNoClose[0]).toBe(octree.getNodeIcon(root));
    });

    test('Handles boundary conditions: zero threshold and exact distance match', () => {
      const octree = new IconOctree([iconMocks[6], iconMocks[7]], unitBounds, 2); // origin and (1,0,0)
      const root = octree.findNodesByLevel(0)[0];

      // Zero threshold: only includes icon at exact camera position (distance 0 <= 0)
      const zeroThreshold = octree.getIconsFromClusteredNode(root, positions[6], 0);
      expect(zeroThreshold).toContain(iconMocks[6]);
      expect(zeroThreshold).not.toContain(iconMocks[7]);

      // Exact threshold: includes icon at exactly threshold distance (distance 1 <= 1)
      const exactThreshold = octree.getIconsFromClusteredNode(root, positions[6], 1);
      expect(exactThreshold).toContain(iconMocks[6]);
      expect(exactThreshold).toContain(iconMocks[7]);
    });

    test('Returns all icons when all are within distance threshold', () => {
      const testIcons = [iconMocks[1], iconMocks[2], iconMocks[3], iconMocks[4]];
      const octree = new IconOctree(testIcons, unitBounds, 2);
      const root = octree.findNodesByLevel(0)[0];

      const result = octree.getIconsFromClusteredNode(root, positions[2], 10);
      expect(result.length).toBe(testIcons.length);
      testIcons.forEach(icon => expect(result).toContain(icon));
    });
  });
});
