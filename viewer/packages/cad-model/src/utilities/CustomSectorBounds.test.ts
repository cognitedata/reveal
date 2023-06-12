/*!
 * Copyright 2023 Cognite AS
 */

import * as THREE from 'three';
import { CustomSectorBounds } from './CustomSectorBounds';
import { CadNode } from '../wrappers/CadNode';
import { Mock } from 'moq.ts';
import { createV9SectorMetadata } from '../../../../test-utilities';
import { SectorMetadata } from '@reveal/cad-parsers';
import { traverseDepthFirst } from '@reveal/utilities';

/*

The following drawing shows the sectors and nodes used in this test. The layout is "2D": All sectors and nodes span z from 0 to 1, and all transforms
are simple translations in x and y. This shouldn't decrease the likelihood of discovering a logical error in the code under test by much, but it makes 
it much easier to reason about the expected result of any given test.

(0,0)                                                                                                                          (8,0)
  ┌───────────────┬───────────────┬─────────────────────────────┬────────────────────────────────────────────────────────────────┐
  │               │               │                             │                                                                │
  │               │               │                             │                                                                │
  │               │               │                             │                                                                │
  │               │               │                             │                                                                │
  │     node A    │               │                             │                                                                │
  │               │               │                             │                                                                │
  │               │               │                             │                                                                │
  │               │               │                             │                                                                │
  │               │               │                             │                                                                │
  ├───────────────┘               │              ┌──────────────┤                                                                │
  │                               │              │              │                                                                │
  │                               │              │              │                                                                │
  │                               │              │              │                                                                │
  │                               │              │    node B    │                                                                │
  │                               │              │              │                                                                │
  │                               │              │              │                                                                │
  │                               │              │              │                                                                │
  │ sector 2                      │              │              │                                                                │
  ├───────────────────────────────┘              └──────────────┤                                                                │
  │                                                             │                                                                │
  │                                                             │                                                                │
  │                                                             │                                                                │
  │                                      ┌──────────────┐       │                                                                │
  │                                      │              │       │                                                                │
  │                                      │              │       │                                                                │
  │                                      │    node C    │       │                                                                │
  │                               ┌──────┼──────────────┼───────┼────────────────────────────────────────────────────────────────┤
  │                               │      │              │       │                                                       sector 3 │
  │                               │      │              │       │                                                                │
  │                               │      │              │       │                                                                │
  │                               │      └──────────────┘       │                                                                │
  │                               │                             │                                                                │
  │                               │                             │                                                                │
  │ sector 1                      │                             │                                                                │
  ├───────────────────────────────┼─────────────────────────────┘                            ┌───────────────────────────────────┤
  │                               │                                                          │sector 5                           │
  │                               │                                                          │                                   │
  │                               │                                                          │                                   │
  │                               │                                                          │                                   │
  │                               │                                                          │                                   │
  │                               │                                                          │                                   │
  │                               │                                                          │                                   │
  │                               │                                                          │                                   │
  │                               │                                                          │                                   │
  │                               │                                                          │                                   │
  │                               │                                                          │                                   │
  │                               │                                                          │                                   │
  │                               │                                                          │                                   │
  │                               │                                                          │                                   │
  │                               │                                                          │                                   │
  │                               │              ┌───────────────────────────────────────────┼───────────────────────────────────┤
  │                               │              │sector 4                                   │                                   │
  │                               │              │                                           │                                   │
  │                               │              │                                           │                                   │
  │                               │              │                                           │                                   │
  │                               │              │                            ┌──────────────┼────────────────┐                  │
  │                               │              │                            │              │                │                  │
  │                               │              │                            │              │                │                  │
  │                               │              │                            │           node D              │                  │
  │                               │              │                            │              │                │                  │
  │                               │              │                            │              │                │                  │
  │                               │              │                            └──────────────┼────────────────┘                  │
  │                               │              │                                           │                                   │
  │                               │              │                                           │                                   │
  │ sector 0                      │              │                                           │                                   │
  └───────────────────────────────┴──────────────┴───────────────────────────────────────────┴───────────────────────────────────┘
(0,8)                                                                                                                          (8,8)

*/

type DummyNode = {
  treeIndex: number;
  originalBoundingBox: THREE.Box3;
};

describe('CustomSectorBounds', () => {
  let customSectorBounds: CustomSectorBounds;
  let cadNodeMock: Mock<CadNode>;
  let sectorMetadataRoot: SectorMetadata;
  let sectorMetadataById: Map<number, SectorMetadata>;
  let originalSectorBounds: Map<number, THREE.Box3>;

  const nodeA: DummyNode = { treeIndex: 1000, originalBoundingBox: boundsFrom(0, 0, 1, 1) };
  const nodeB: DummyNode = { treeIndex: 1001, originalBoundingBox: boundsFrom(3, 1, 4, 2) };
  const nodeC: DummyNode = { treeIndex: 1002, originalBoundingBox: boundsFrom(2.5, 2.5, 3.5, 3.5) };
  const nodeD: DummyNode = { treeIndex: 1003, originalBoundingBox: boundsFrom(5, 6.5, 7, 7.5) };

  beforeEach(() => {
    // Define sectors
    sectorMetadataRoot = createV9SectorMetadata([
      0,
      [
        [1, [[2, [], boundsFrom(0, 0, 2, 2)]], boundsFrom(0, 0, 4, 4)],
        [
          3,
          [
            [4, [], boundsFrom(3, 6, 8, 8)],
            [5, [], boundsFrom(6, 4, 8, 8)]
          ],
          boundsFrom(2, 3, 8, 8)
        ]
      ],
      boundsFrom(0, 0, 8, 8)
    ]);

    // Collect sector metadata into map
    sectorMetadataById = new Map<number, SectorMetadata>();
    traverseDepthFirst(sectorMetadataRoot, x => {
      sectorMetadataById.set(x.id, x);
      return true;
    });

    // Store copy of sector bounds
    originalSectorBounds = new Map<number, THREE.Box3>();
    for (const [sectorId, sectorMetadata] of sectorMetadataById) {
      originalSectorBounds.set(sectorId, sectorMetadata.subtreeBoundingBox.clone());
    }

    // Setup CadNode mock
    cadNodeMock = new Mock<CadNode>();
    cadNodeMock.setup(x => x.sectorScene.getSectorById).returns((sectorId: number) => sectorMetadataById.get(sectorId));
    cadNodeMock.setup(x => x.sectorScene.getAllSectors).returns(() => [...sectorMetadataById.values()]);

    customSectorBounds = new CustomSectorBounds(cadNodeMock.object());
  });

  test('Transform single node', () => {
    expect(customSectorBounds.isRegistered(nodeA.treeIndex)).toBeFalse();

    // Register node A
    customSectorBounds.registerTransformedNode(nodeA.treeIndex, nodeA.originalBoundingBox);
    customSectorBounds.recomputeSectorBounds(); // Missing sectors and transform, nothing should happen

    expect(customSectorBounds.isRegistered(nodeA.treeIndex)).toBeTrue();
    [0, 1, 2, 3, 4, 5].forEach(i => expectOriginalBounds(i));

    // Set transform
    customSectorBounds.updateNodeTransform(nodeA.treeIndex, translation(-1, 0));
    customSectorBounds.recomputeSectorBounds(); // Still missing sectors, nothing should happen

    [0, 1, 2, 3, 4, 5].forEach(i => expectOriginalBounds(i));

    // Set sectors
    customSectorBounds.updateNodeSectors(nodeA.treeIndex, [2]);
    customSectorBounds.recomputeSectorBounds(); // Bounds will be changed now

    expectBoundsApproximatelyEqual(2, boundsFrom(-1, 0, 2, 2)); // Contains the node
    expectBoundsApproximatelyEqual(1, boundsFrom(-1, 0, 4, 4)); // Should expand to contain child
    expectBoundsApproximatelyEqual(0, boundsFrom(-1, 0, 8, 8)); // Should expand to contain child
    [3, 4, 5].forEach(i => expectOriginalBounds(i));

    // The transform is reset, and everything should revert back to the original values
    customSectorBounds.unregisterTransformedNode(nodeA.treeIndex);
    customSectorBounds.recomputeSectorBounds();

    expect(customSectorBounds.isRegistered(nodeA.treeIndex)).toBeFalse();
    [0, 1, 2, 3, 4, 5].forEach(i => expectOriginalBounds(i));
  });

  test('Transform two nodes that share a sector', () => {
    // Transform node A and B, in sector 1
    customSectorBounds.registerTransformedNode(nodeA.treeIndex, nodeA.originalBoundingBox);
    customSectorBounds.registerTransformedNode(nodeB.treeIndex, nodeB.originalBoundingBox);
    customSectorBounds.updateNodeSectors(nodeA.treeIndex, [1]);
    customSectorBounds.updateNodeSectors(nodeB.treeIndex, [1]);
    customSectorBounds.updateNodeTransform(nodeA.treeIndex, translation(-1, 0));
    customSectorBounds.updateNodeTransform(nodeB.treeIndex, translation(1, 0));
    customSectorBounds.recomputeSectorBounds();

    expectBoundsApproximatelyEqual(1, boundsFrom(-1, 0, 5, 4)); // Contains the nodes
    expectBoundsApproximatelyEqual(0, boundsFrom(-1, 0, 8, 8)); // Should expand to contain child
    [2, 3, 4, 5].forEach(i => expectOriginalBounds(i));

    // Transform of node A is reset
    customSectorBounds.unregisterTransformedNode(nodeA.treeIndex);
    customSectorBounds.recomputeSectorBounds();

    expectBoundsApproximatelyEqual(1, boundsFrom(0, 0, 5, 4)); // Still contains node B
    [0, 2, 3, 4, 5].forEach(i => expectOriginalBounds(i));

    // Transform of node B is reset
    customSectorBounds.unregisterTransformedNode(nodeB.treeIndex);
    customSectorBounds.recomputeSectorBounds();

    [0, 1, 2, 3, 4, 5].forEach(i => expectOriginalBounds(i));
  });

  test('Transform two nodes at different depths, affecting a sector both directly and indirectly', () => {
    // Transform node A, which is known to be in sector 2
    customSectorBounds.registerTransformedNode(nodeA.treeIndex, nodeA.originalBoundingBox);
    customSectorBounds.updateNodeSectors(nodeA.treeIndex, [2]);
    customSectorBounds.updateNodeTransform(nodeA.treeIndex, translation(-1, 0));

    // Transform node B, which is known to be in sector 1
    customSectorBounds.registerTransformedNode(nodeB.treeIndex, nodeB.originalBoundingBox);
    customSectorBounds.updateNodeSectors(nodeB.treeIndex, [1]);
    customSectorBounds.updateNodeTransform(nodeB.treeIndex, translation(1, 0));
    customSectorBounds.recomputeSectorBounds();

    expectBoundsApproximatelyEqual(2, boundsFrom(-1, 0, 2, 2)); // Contains node A
    expectBoundsApproximatelyEqual(1, boundsFrom(-1, 0, 5, 4)); // Affected directly by node B, and indirectly by node A (which is in a child sector)
    expectBoundsApproximatelyEqual(0, boundsFrom(-1, 0, 8, 8)); // Should expand to contain child
    [3, 4, 5].forEach(i => expectOriginalBounds(i));

    // Transform of node B is reset
    customSectorBounds.unregisterTransformedNode(nodeB.treeIndex);
    customSectorBounds.recomputeSectorBounds();

    expectBoundsApproximatelyEqual(2, boundsFrom(-1, 0, 2, 2)); // Contains node A
    expectBoundsApproximatelyEqual(1, boundsFrom(-1, 0, 4, 4)); // Should expand to contain child
    expectBoundsApproximatelyEqual(0, boundsFrom(-1, 0, 8, 8)); // Should expand to contain child
    [3, 4, 5].forEach(i => expectOriginalBounds(i));

    // Transform of node A is reset
    customSectorBounds.unregisterTransformedNode(nodeA.treeIndex);
    customSectorBounds.recomputeSectorBounds();

    [0, 1, 2, 3, 4, 5].forEach(i => expectOriginalBounds(i));
  });

  test('Sector with no overlap with node bounding box should never be affected', () => {
    // Transform node A, wrongfully said to contain geometry in sector 3
    customSectorBounds.registerTransformedNode(nodeA.treeIndex, nodeA.originalBoundingBox);
    customSectorBounds.updateNodeSectors(nodeA.treeIndex, [3]);
    customSectorBounds.updateNodeTransform(nodeA.treeIndex, translation(100, 0));
    customSectorBounds.recomputeSectorBounds();

    [0, 1, 2, 3, 4, 5].forEach(i => expectOriginalBounds(i));
  });

  test('Sector with partial overlap with node bounding box should only be affect by intersection', () => {
    // Transform node C, which is only partially inside sector 3
    customSectorBounds.registerTransformedNode(nodeC.treeIndex, nodeC.originalBoundingBox);
    customSectorBounds.updateNodeSectors(nodeC.treeIndex, [3]);
    customSectorBounds.updateNodeTransform(nodeC.treeIndex, translation(0, -1));
    customSectorBounds.recomputeSectorBounds();

    expectBoundsApproximatelyEqual(3, boundsFrom(2, 2, 8, 8)); // Contains part of node C
    [0, 1, 2, 4, 5].forEach(i => expectOriginalBounds(i));
  });

  test('Transform node present in both parent and child sector', () => {
    // Transform node A, in sector 1 and 2
    customSectorBounds.registerTransformedNode(nodeA.treeIndex, nodeA.originalBoundingBox);
    customSectorBounds.updateNodeSectors(nodeA.treeIndex, [1, 2]);
    customSectorBounds.updateNodeTransform(nodeA.treeIndex, translation(-1, 0));
    customSectorBounds.recomputeSectorBounds();

    expectBoundsApproximatelyEqual(2, boundsFrom(-1, 0, 2, 2)); // Contains node A
    expectBoundsApproximatelyEqual(1, boundsFrom(-1, 0, 4, 4)); // Contains node A
    expectBoundsApproximatelyEqual(0, boundsFrom(-1, 0, 8, 8)); // Should expand to contain child
    [3, 4, 5].forEach(i => expectOriginalBounds(i));
  });

  test('Transform node present in two sibling sectors', () => {
    // Transform node D, in sector 4 and 5
    customSectorBounds.registerTransformedNode(nodeD.treeIndex, nodeD.originalBoundingBox);
    customSectorBounds.updateNodeSectors(nodeD.treeIndex, [4, 5]);
    customSectorBounds.updateNodeTransform(nodeD.treeIndex, translation(-4, 0));
    customSectorBounds.recomputeSectorBounds();

    expectBoundsApproximatelyEqual(5, boundsFrom(2, 4, 8, 8)); // Contains node D
    expectBoundsApproximatelyEqual(4, boundsFrom(1, 6, 8, 8)); // Contains node D
    expectBoundsApproximatelyEqual(3, boundsFrom(1, 3, 8, 8)); // Should expand to contain children
    [0, 1, 2].forEach(i => expectOriginalBounds(i));
  });

  test('Transform node before knowledge of which sectors the node has geometry in', () => {
    // Register node A with empty sector set
    customSectorBounds.registerTransformedNode(nodeA.treeIndex, nodeA.originalBoundingBox);
    customSectorBounds.updateNodeTransform(nodeA.treeIndex, translation(-1, 0));
    customSectorBounds.updateNodeSectors(nodeA.treeIndex, []);
    customSectorBounds.recomputeSectorBounds();

    [0, 1, 2, 3, 4, 5].forEach(i => expectOriginalBounds(i));

    // Update knowledge of sectors for node A
    customSectorBounds.updateNodeSectors(nodeA.treeIndex, [2]);
    customSectorBounds.recomputeSectorBounds();

    expectBoundsApproximatelyEqual(2, boundsFrom(-1, 0, 2, 2)); // Contains the node
    expectBoundsApproximatelyEqual(1, boundsFrom(-1, 0, 4, 4)); // Should expand to contain child
    expectBoundsApproximatelyEqual(0, boundsFrom(-1, 0, 8, 8)); // Should expand to contain child
    [3, 4, 5].forEach(i => expectOriginalBounds(i));
  });

  test('Complex sequence with multiple transforms and nodes', () => {
    // Transform node A
    customSectorBounds.registerTransformedNode(nodeA.treeIndex, nodeA.originalBoundingBox);
    customSectorBounds.updateNodeSectors(nodeA.treeIndex, [1, 2]);
    customSectorBounds.updateNodeTransform(nodeA.treeIndex, translation(0, -0.5));

    // Transform node B
    customSectorBounds.registerTransformedNode(nodeB.treeIndex, nodeB.originalBoundingBox);
    customSectorBounds.updateNodeSectors(nodeB.treeIndex, [1]);
    customSectorBounds.updateNodeTransform(nodeB.treeIndex, translation(0, -2));

    // Transform node C
    customSectorBounds.registerTransformedNode(nodeC.treeIndex, nodeC.originalBoundingBox);
    customSectorBounds.updateNodeSectors(nodeC.treeIndex, [1]);
    customSectorBounds.updateNodeTransform(nodeC.treeIndex, translation(0, -1));
    customSectorBounds.recomputeSectorBounds();

    expectBoundsApproximatelyEqual(2, boundsFrom(0, -0.5, 2, 2)); // Driven by node A
    expectBoundsApproximatelyEqual(1, boundsFrom(0, -1, 4, 4)); // Driven by node B
    expectBoundsApproximatelyEqual(0, boundsFrom(0, -1, 8, 8)); // Shold expand to contain sector 1
    [3, 4, 5].forEach(i => expectOriginalBounds(i));

    // Transform node B again, making sector 1 contract slightly
    customSectorBounds.updateNodeTransform(nodeB.treeIndex, translation(0, -1));
    customSectorBounds.recomputeSectorBounds();
    expectBoundsApproximatelyEqual(1, boundsFrom(0, -0.5, 4, 4)); // Should contract because node B is no longer pushing
    expectBoundsApproximatelyEqual(0, boundsFrom(0, -0.5, 8, 8)); // Should contract because it can

    // Node C is disovered to have geometry in sector 3
    customSectorBounds.updateNodeSectors(nodeC.treeIndex, [3]);
    customSectorBounds.recomputeSectorBounds();
    expectBoundsApproximatelyEqual(3, boundsFrom(2, 2, 8, 8)); // Contains part of node C

    // Transform node D
    customSectorBounds.registerTransformedNode(nodeD.treeIndex, nodeD.originalBoundingBox);
    customSectorBounds.updateNodeSectors(nodeD.treeIndex, [5]);
    customSectorBounds.updateNodeTransform(nodeD.treeIndex, translation(2, 0));
    customSectorBounds.recomputeSectorBounds();

    expectBoundsApproximatelyEqual(5, boundsFrom(6, 4, 9, 8)); // Contains node D
    expectBoundsApproximatelyEqual(3, boundsFrom(2, 2, 9, 8)); // Affected by node C and D
    expectBoundsApproximatelyEqual(0, boundsFrom(0, -0.5, 9, 8)); // Shold expand to contain sector 3 (and 1 from before)

    // Node D is disovered to have geometry in sector 4
    customSectorBounds.updateNodeSectors(nodeD.treeIndex, [4]);
    customSectorBounds.recomputeSectorBounds();

    expectBoundsApproximatelyEqual(4, boundsFrom(3, 6, 9, 8));

    // Unregister all nodes
    customSectorBounds.unregisterTransformedNode(nodeA.treeIndex);
    customSectorBounds.unregisterTransformedNode(nodeB.treeIndex);
    customSectorBounds.unregisterTransformedNode(nodeC.treeIndex);
    customSectorBounds.unregisterTransformedNode(nodeD.treeIndex);
    customSectorBounds.recomputeSectorBounds();

    [0, 1, 2, 3, 4, 5].forEach(i => expectOriginalBounds(i));
  });

  function translation(x: number, y: number): THREE.Matrix4 {
    return new THREE.Matrix4().setPosition(x, y, 0);
  }

  function boundsFrom(minX: number, minY: number, maxX: number, maxY: number): THREE.Box3 {
    return new THREE.Box3().setFromArray([minX, minY, 0, maxX, maxY, 1]);
  }

  function expectOriginalBounds(sectorId: number) {
    const sectorBounds = sectorMetadataById.get(sectorId)?.subtreeBoundingBox;
    const originalBounds = originalSectorBounds.get(sectorId);
    if (!sectorBounds || !originalBounds) {
      fail(`Failed to get metadata or original bounds for sector ${sectorId}`);
    }

    expect(sectorBounds.equals(originalBounds)).toBeTrue();
  }

  function expectBoundsApproximatelyEqual(sectorId: number, expected: THREE.Box3, precision = 3) {
    const sectorBounds = sectorMetadataById.get(sectorId)?.subtreeBoundingBox;
    if (!sectorBounds) {
      fail(`Failed to get metadata for sector ${sectorId}`);
    }

    expect(sectorBounds.min.x).toBeCloseTo(expected.min.x, precision);
    expect(sectorBounds.min.y).toBeCloseTo(expected.min.y, precision);
    expect(sectorBounds.min.z).toBeCloseTo(expected.min.z, precision);
    expect(sectorBounds.max.x).toBeCloseTo(expected.max.x, precision);
    expect(sectorBounds.max.y).toBeCloseTo(expected.max.y, precision);
    expect(sectorBounds.max.z).toBeCloseTo(expected.max.z, precision);
  }
});
