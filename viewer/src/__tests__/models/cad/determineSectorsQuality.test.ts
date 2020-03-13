/*!
 * Copyright 2020 Cognite AS
 */
import { SectorMetadata, SectorScene } from '../../../models/cad/types';
import { Box3 } from '../../../utils/Box3';
import { determineSectorsFromListOfDetailed } from '../../../models/cad/determineSectors';
import { expectSetEqual } from '../../expects';
import { traverseDepthFirst } from '../../../utils/traversal';

function createSceneFromRoot(root: SectorMetadata): SectorScene {
  const sectors = new Map<number, SectorMetadata>();
  traverseDepthFirst(root, sector => {
    sectors.set(sector.id, sector);
    return true;
  });
  let maxTreeIndex = -1;
  sectors.forEach(v => (maxTreeIndex = Math.max(maxTreeIndex, v.id)));

  return {
    version: 8,
    root,
    sectors,
    maxTreeIndex
  };
}

function sectorNodeFromTreeNode(node: TreeNode, parent?: SectorMetadata): SectorMetadata {
  const result = {
    id: node.id,
    path: '',
    bounds: new Box3([]),
    depth: 0,
    parent,
    children: new Array<SectorMetadata>(),
    indexFile: {
      fileName: `sector_${node.id}.i3d`,
      peripheralFiles: [],
      estimatedDrawCallCount: 10,
      downloadSize: 1000
    },
    facesFile: {
      fileName: `sector_${node.id}.f3d`,
      quadSize: 1.5,
      coverageFactors: {
        xy: 0.6,
        yz: 0.5,
        xz: 0.8
      },
      downloadSize: 100
    }
  };
  result.children = node.children.map(x => sectorNodeFromTreeNode(x, result));
  return result;
}

interface TreeNode {
  id: number;
  children: TreeNode[];
}

describe('determineSectorsQuality', () => {
  const treeRoot: TreeNode = {
    id: 1,
    children: [
      {
        id: 2,
        children: [
          {
            id: 3,
            children: []
          },
          {
            id: 4,
            children: []
          }
        ]
      },
      {
        id: 5,
        children: []
      },
      {
        id: 6,
        children: [
          {
            id: 7,
            children: []
          },
          {
            id: 8,
            children: []
          }
        ]
      }
    ]
  };

  const root: SectorMetadata = sectorNodeFromTreeNode(treeRoot);
  const scene = createSceneFromRoot(root);

  test('no detailed gives root as simple', () => {
    const detailed: number[] = [];
    const sectors = determineSectorsFromListOfDetailed(scene, new Set(detailed));
    expectSetEqual(sectors.simple, [1]);
    expectSetEqual(sectors.detailed, []);
  });

  test('root detailed makes children simple', () => {
    const detailed: number[] = [1];
    const sectors = determineSectorsFromListOfDetailed(scene, new Set(detailed));
    expectSetEqual(sectors.simple, [2, 5, 6]);
    expectSetEqual(sectors.detailed, [1]);
  });

  test('leaf node makes all parents detailed', () => {
    const detailed: number[] = [8];
    const sectors = determineSectorsFromListOfDetailed(scene, new Set(detailed));
    expectSetEqual(sectors.simple, [2, 5, 7]);
    expectSetEqual(sectors.detailed, [1, 6, 8]);
  });

  test('lone node leaves other branches simple', () => {
    const detailed: number[] = [5];
    const sectors = determineSectorsFromListOfDetailed(scene, new Set(detailed));
    expectSetEqual(sectors.simple, [2, 6]);
    expectSetEqual(sectors.detailed, [1, 5]);
  });

  test('detailed at different levels', () => {
    const detailed: number[] = [2, 7];
    const sectors = determineSectorsFromListOfDetailed(scene, new Set(detailed));
    expectSetEqual(sectors.simple, [3, 4, 5, 8]);
    expectSetEqual(sectors.detailed, [1, 2, 6, 7]);
  });

  test('all detailed', () => {
    const detailed: number[] = [1, 2, 3, 4, 5, 6, 7, 8];
    const sectors = determineSectorsFromListOfDetailed(scene, new Set(detailed));
    expectSetEqual(sectors.simple, []);
    expectSetEqual(sectors.detailed, [1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
