/*!
 * Copyright 2023 Cognite AS
 */

import * as THREE from 'three';
import { CustomSectorBounds } from './CustomSectorBounds';
import { CadNode } from '../wrappers/CadNode';
import { Mock } from 'moq.ts';
import { createV9SectorMetadata } from '../../../../test-utilities';
import { RootSectorNode, SectorMetadata, SectorNode } from '@reveal/cad-parsers';
import { traverseDepthFirst } from '@reveal/utilities';

describe('CustomSectorBounds', () => {
  let customSectorBounds: CustomSectorBounds;
  let cadNodeMock: Mock<CadNode>;
  let sectorMetadataRoot: SectorMetadata;
  let sectorMetadataById: Map<number, SectorMetadata>;

  beforeEach(() => {
    // Define sectors
    sectorMetadataRoot = createV9SectorMetadata([
      0,
      [
        [1, [], new THREE.Box3().setFromArray([-1, -1, 0, 0, 1, 1])],
        [2, [], new THREE.Box3().setFromArray([0, -1, 1, 0, 0, 1])],
        [3, [], new THREE.Box3().setFromArray([-1, 0, 1, 0, 1, 1])],
        [4, [], new THREE.Box3().setFromArray([0, 0, 1, 1, 1, 1])]
      ],
      new THREE.Box3().setFromArray([-1, -1, -1, 1, 1, 1])
    ]);

    sectorMetadataById = new Map<number, SectorMetadata>();
    traverseDepthFirst(sectorMetadataRoot, x => {
      sectorMetadataById.set(x.id, x);
      return true;
    });

    const sectorsSortedByDepth: SectorMetadata[] = [];
    for (const [_, sectorMetadata] of sectorMetadataById) {
      sectorsSortedByDepth.push(sectorMetadata);
    }
    sectorsSortedByDepth.sort((a, b) => b.depth - a.depth); // First element will be deepest

    const sectorNodes = new Map<number, SectorNode>();
    for (const sectorMetadata of sectorsSortedByDepth) {
      const sectorNodeMock = new Mock<SectorNode>();

      const children: SectorNode[] = [];
      for (const child of sectorMetadata.children) {
        const childNode = sectorNodes.get(child.id);
        if (!childNode) {
          fail('Internal test error. Should never happen');
        }
        children.push(childNode);
      }

      sectorNodeMock.setup(x => x.children).returns(children);
      sectorNodes.set(sectorMetadata.id, sectorNodeMock.object());
    }

    const sectorNodeRoot = sectorNodes.get(sectorMetadataRoot.id);
    if (!sectorNodeRoot) {
      fail('Internal test error. Should never happen');
    }

    cadNodeMock = new Mock<CadNode>();
    cadNodeMock.setup(x => x.sectorScene.getSectorById).returns((sectorId: number) => sectorMetadataById.get(sectorId));
    cadNodeMock.setup(x => x.rootSector).returns(sectorNodeRoot as RootSectorNode);

    customSectorBounds = new CustomSectorBounds(cadNodeMock.object());
  });

  test('Register and transform a node', () => {
    const treeIndex = 1337;
    const originalBoundingBox = new THREE.Box3(new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 1, 1)); // Equal to bounds of sector 4
    const customTransform = new THREE.Matrix4().setPosition(0.1, 0, 0);
    expect(customSectorBounds.isRegistered(treeIndex)).toBeFalse();

    customSectorBounds.registerTransformedNode(treeIndex, originalBoundingBox);
    customSectorBounds.updateNodeTransform(treeIndex, customTransform);
    customSectorBounds.updateNodeSectors(treeIndex, [4]);
    customSectorBounds.recomputeSectorBounds();

    expect(sectorMetadataById.get(4)?.subtreeBoundingBox.max.x).toBeCloseTo(1.1);
  });
});
