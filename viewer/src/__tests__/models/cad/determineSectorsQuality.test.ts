/*!
 * Copyright 2020 Cognite AS
 */
import { SectorMetadata } from '../../../dataModels/cad/internal/sector/types';
import { Box3 } from '../../../utilities/Box3';
import { determineSectorsFromDetailed } from '../../../dataModels/cad/internal/sector/culling/determineSectors';
import { expectContainsSectorsWithLevelOfDetail } from '../../expects';
import { createSceneFromRoot } from '../../testUtils/createSceneFromRoot';
import { CadModelMetadata } from '../../../dataModels/cad/internal';
import { fromCdfToThreeJsCoordinates, fromThreeJsToCdfCoordinates } from '../../../utilities/fromThreeCameraConfig';

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
      recursiveCoverageFactors: {
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
  const cadModel: CadModelMetadata = {
    blobUrl: 'test',
    modelTransformation: { modelMatrix: fromCdfToThreeJsCoordinates, inverseModelMatrix: fromThreeJsToCdfCoordinates },
    // dataRetriever: { fetchData: jest.fn(), fetchJson: jest.fn() },
    scene
  };

  test('no detailed gives root as simple', () => {
    const detailed: number[] = [];
    const sectors = determineSectorsFromDetailed(cadModel, new Set(detailed));
    expectContainsSectorsWithLevelOfDetail(sectors, [1], []);
  });

  test('root detailed makes children simple', () => {
    const detailed: number[] = [1];
    const sectors = determineSectorsFromDetailed(cadModel, new Set(detailed));
    expectContainsSectorsWithLevelOfDetail(sectors, [2, 5, 6], [1]);
  });

  test('leaf node makes all parents detailed', () => {
    const detailed: number[] = [8];
    const sectors = determineSectorsFromDetailed(cadModel, new Set(detailed));
    expectContainsSectorsWithLevelOfDetail(sectors, [2, 5, 7], [1, 6, 8]);
  });

  test('lone node leaves other branches simple', () => {
    const detailed: number[] = [5];
    const sectors = determineSectorsFromDetailed(cadModel, new Set(detailed));
    expectContainsSectorsWithLevelOfDetail(sectors, [2, 6], [1, 5]);
  });

  test('detailed at different levels', () => {
    const detailed: number[] = [2, 7];
    const sectors = determineSectorsFromDetailed(cadModel, new Set(detailed));
    expectContainsSectorsWithLevelOfDetail(sectors, [3, 4, 5, 8], [1, 2, 6, 7]);
  });

  test('all detailed', () => {
    const detailed: number[] = [1, 2, 3, 4, 5, 6, 7, 8];
    const sectors = determineSectorsFromDetailed(cadModel, new Set(detailed));
    expectContainsSectorsWithLevelOfDetail(sectors, [], [1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
