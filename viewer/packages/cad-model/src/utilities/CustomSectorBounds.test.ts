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
  //const nodeC: DummyNode = { treeIndex: 1002, originalBoundingBox: boundsFrom(2.5, 2.5, 3.5, 3.5) };
  //const nodeD: DummyNode = { treeIndex: 1003, originalBoundingBox: boundsFrom(5, 6.5, 7, 7.5) };

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

    setupCadNodeMock();

    customSectorBounds = new CustomSectorBounds(cadNodeMock.object());
  });

  function setupCadNodeMock(): void {
    /*
    // The tree of SectorNode mocks needs to be built bottom up, due to the way a mock is built.
    // The .setup() on a node needs the .object() of every one of its children, meaning they already have to
    // have their children done, and so on...

    // Sort the sectors by descending depth
    const sectorsSortedByDepth: SectorMetadata[] = [];
    for (const [_, sectorMetadata] of sectorMetadataById) {
      sectorsSortedByDepth.push(sectorMetadata);
    }
    sectorsSortedByDepth.sort((a, b) => b.depth - a.depth);

    const sectorNodes = new Map<number, SectorNode>();

    // Start building the tree of sector node mocks
    for (const sectorMetadata of sectorsSortedByDepth) {
      // Create the mock
      const sectorNodeMock = new Mock<SectorNode>();

      // Gather all the child mocks
      const children: SectorNode[] = [];
      for (const child of sectorMetadata.children) {
        const childNode = sectorNodes.get(child.id);
        if (!childNode) {
          fail('Internal test setup error');
        }
        children.push(childNode);
      }

      // Attach children
      sectorNodeMock.setup(x => x.children).returns(children);

      // Make it return its id
      sectorNodeMock.setup(x => x.sectorId).returns(sectorMetadata.id);

      // Store this mock node for use in the ancestors' children arrays
      sectorNodes.set(sectorMetadata.id, sectorNodeMock.object());
    }

    // Get a reference to the root sector node
    const sectorNodeRoot = sectorNodes.get(sectorMetadataRoot.id);
    if (!sectorNodeRoot) {
      fail('Internal test setup error');
    }

    console.log(sectorNodeRoot.children);
    */

    // Finally, create the CadNode mock
    cadNodeMock = new Mock<CadNode>();
    cadNodeMock.setup(x => x.sectorScene.getSectorById).returns((sectorId: number) => sectorMetadataById.get(sectorId));
    cadNodeMock.setup(x => x.sectorScene.getAllSectors).returns(() => [...sectorMetadataById.values()]);
    //cadNodeMock.setup(x => x.rootSector).returns(sectorNodeRoot as RootSectorNode);
  }

  test('Transform single node', () => {
    expect(customSectorBounds.isRegistered(nodeA.treeIndex)).toBeFalse();

    // Transform node A, which is known to be in sector 2
    customSectorBounds.registerTransformedNode(nodeA.treeIndex, nodeA.originalBoundingBox);
    customSectorBounds.updateNodeSectors(nodeA.treeIndex, [2]);
    customSectorBounds.updateNodeTransform(nodeA.treeIndex, translation(-1, 0));
    customSectorBounds.recomputeSectorBounds();

    expect(customSectorBounds.isRegistered(nodeA.treeIndex)).toBeTrue();
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
    expectBoundsApproximatelyEqual(1, boundsFrom(-1, 0, 5, 4)); // Affect directly by node B, and indirectly by node A (which is in a child sector)
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
