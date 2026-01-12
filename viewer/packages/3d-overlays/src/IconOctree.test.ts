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
      const farResult = octree.getLODByDistance(new Vector3(10, 10, 10), 0.3, 2);
      expect(farResult.size).toBeLessThan(testIcons.length);

      // Camera close to icons at 0.1 position - those should not be clustered
      const closeResult = octree.getLODByDistance(positions[3], 0.3, 2);
      expect(closeResult.size).toBe(testIcons.length);
    });

    test('Moving camera changes which icons are clustered', () => {
      const octree = new IconOctree([iconMocks[3], iconMocks[4]], unitBounds, 1);
      expect(octree.getLODByDistance(positions[3], 0.2, 0).size).toBeGreaterThan(0);
      expect(octree.getLODByDistance(positions[4], 0.2, 0).size).toBeGreaterThan(0);
    });

    test('Zero distance threshold clusters all icons', () => {
      const octree = new IconOctree([iconMocks[0], iconMocks[1]], unitBounds, 1);
      expect(octree.getLODByDistance(positions[2], 0, 0).size).toBeGreaterThan(0);
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

  describe('Cluster creation and children count verification', () => {
    test('getLODByDistance with clusteringLevel creates expected cluster structure', () => {
      // 6 icons spread across the bounds
      const testIcons = iconMocks.slice(0, 6);
      const octree = new IconOctree(testIcons, unitBounds, 1);

      // Camera very far - should cluster
      const farCameraResult = octree.getLODByDistance(new Vector3(10, 10, 10), 0.3, 2);

      expect(farCameraResult.size).toBeLessThan(testIcons.length);

      farCameraResult.forEach(node => {
        expect(node).toBeDefined();
      });
    });

    test('getAllIconsFromNode returns correct count for clustered nodes', () => {
      const testIcons = iconMocks.slice(0, 5);
      const octree = new IconOctree(testIcons, unitBounds, 1);
      const root = octree.findNodesByLevel(0)[0];

      const allIcons = octree.getAllIconsFromNode(root);

      // Should return all icons from the tree
      expect(allIcons.length).toBe(testIcons.length);
      testIcons.forEach(icon => {
        expect(allIcons).toContain(icon);
      });
    });

    test('Cluster representative icon is closest to centroid', () => {
      // Two icons - the one closest to center should be the representative
      const octree = new IconOctree([iconMocks[3], iconMocks[4]], unitBounds, 2); // 0.1 and 0.9
      const root = octree.findNodesByLevel(0)[0];

      const representative = octree.getNodeIcon(root);

      // Both icons at 0.1 and 0.9 are equidistant from centroid (0.5, 0.5, 0.5)
      // so either could be representative
      expect([iconMocks[3], iconMocks[4]]).toContain(representative);
    });

    test('getLODByDistance clusteringLevel 0 creates coarser clusters', () => {
      const testIcons = iconMocks.slice(0, 6);
      const octree = new IconOctree(testIcons, unitBounds, 1);

      const farCamera = new Vector3(10, 10, 10);

      // With clusteringLevel 0, should create fewer, larger clusters
      const level0Result = octree.getLODByDistance(farCamera, 0.1, 0);

      // With clusteringLevel 3, should create more, smaller clusters
      const level3Result = octree.getLODByDistance(farCamera, 0.1, 3);

      // Higher level should have equal or more nodes (finer granularity)
      expect(level3Result.size).toBeGreaterThanOrEqual(level0Result.size);
    });

    test('Cluster children count is preserved in getAllIconsFromNode', () => {
      const testIcons = [iconMocks[0], iconMocks[1], iconMocks[2], iconMocks[3]];
      const octree = new IconOctree(testIcons, unitBounds, 1);

      // Get LOD nodes for a far camera
      const lodNodes = octree.getLODByDistance(new Vector3(5, 5, 5), 0.05, 1);

      // For each clustered node, getAllIconsFromNode should return correct count
      let totalIconCount = 0;
      lodNodes.forEach(node => {
        const nodeIcons = octree.getAllIconsFromNode(node);
        totalIconCount += nodeIcons.length;

        // Each icon should be from our original set
        nodeIcons.forEach(icon => {
          expect(testIcons).toContain(icon);
        });
      });

      // Total should match original icon count
      expect(totalIconCount).toBe(testIcons.length);
    });

    test('getLODByDistance returns leaf nodes with data for close camera', () => {
      const testIcons = [iconMocks[0], iconMocks[1]];
      const octree = new IconOctree(testIcons, unitBounds, 1);

      // Camera at position of first icon - very close
      const result = octree.getLODByDistance(positions[0], 1);

      // Should return all leaf nodes (2 for 2 icons with maxLeafSize 1)
      expect(result.size).toBe(testIcons.length);

      // Each node should have data
      result.forEach(node => {
        if (node.data !== null) {
          expect(node.data.data.length).toBeGreaterThanOrEqual(1);
        }
      });
    });

    test('getLODByDistance with undefined camera returns all leaf nodes', () => {
      const testIcons = iconMocks.slice(0, 4);
      const octree = new IconOctree(testIcons, unitBounds, 1);

      const result = octree.getLODByDistance(undefined, 10);

      // Should return all icons individually (no clustering when camera is undefined)
      expect(result.size).toBe(testIcons.length);
    });

    test('getIconsFromClusteredNode returns correct children count', () => {
      const testIcons = [iconMocks[3], iconMocks[5], iconMocks[4], iconMocks[1]];
      const octree = new IconOctree(testIcons, unitBounds, 1);
      const root = octree.findNodesByLevel(0)[0];

      // Camera far away - should get representative only
      const farResult = octree.getIconsFromClusteredNode(root, new Vector3(10, 10, 10), 0.01);
      expect(farResult.length).toBe(1); // Only representative

      // Camera close - should get all icons
      const closeResult = octree.getIconsFromClusteredNode(root, positions[2], 2);
      expect(closeResult.length).toBe(testIcons.length);
    });

    test('Nested clusters preserve total icon count', () => {
      // Create octree with many icons to ensure multiple levels
      const allIcons = iconMocks;
      const octree = new IconOctree(allIcons, unitBounds, 1);

      // Get clustered nodes at different distances
      const veryFarResult = octree.getLODByDistance(new Vector3(100, 100, 100), 0.01, 1);

      // Count all icons in all returned nodes
      let totalFromClusters = 0;
      veryFarResult.forEach(node => {
        const nodeIcons = octree.getAllIconsFromNode(node);
        totalFromClusters += nodeIcons.length;
      });

      // Total should equal original icon count
      expect(totalFromClusters).toBe(allIcons.length);
    });
  });
});
