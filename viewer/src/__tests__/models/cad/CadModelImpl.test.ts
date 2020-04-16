/*!
 * Copyright 2020 Cognite AS
 */

import { CadModelImpl } from '../../../models/cad/CadModelImpl';
import { ModelDataRetriever } from '../../../datasources/ModelDataRetriever';
import { SectorModelTransformation } from '../../../models/cad/types';
import { mat4 } from 'gl-matrix';
import { CadMetadataV8 } from '../../../models/cad/CadMetadataParserV8';

describe('CadModelImpl', () => {
  const INVALID_SECTOR_ID = 42;
  const SECTOR_ID_WITH_FACESFILE = 0;
  const SECTOR_ID_WITHOUT_FACESFILE = 1;

  const metadata: CadMetadataV8 = {
    version: 8,
    maxTreeIndex: 1,
    sectors: [
      {
        id: 0,
        parentId: -1,
        path: '0/',
        depth: 0,
        boundingBox: {
          min: {
            x: 0.0,
            y: 0.0,
            z: 0.0
          },
          max: {
            x: 1.0,
            y: 1.0,
            z: 1.0
          }
        },
        indexFile: {
          fileName: 'sector_0.i3d',
          peripheralFiles: [],
          estimatedDrawCallCount: 10,
          downloadSize: 19996
        },
        facesFile: {
          fileName: 'sector_0.f3d',
          quadSize: 0.5,
          coverageFactors: {
            xy: 0.5,
            xz: 0.5,
            yz: 0.5
          },
          recursiveCoverageFactors: {
            xy: 0.5,
            xz: 0.5,
            yz: 0.5
          },
          downloadSize: 1000
        }
      },
      {
        id: 1,
        parentId: 0,
        path: '0/0/',
        depth: 1,
        boundingBox: {
          min: {
            x: 0.0,
            y: 0.0,
            z: 0.0
          },
          max: {
            x: 1.0,
            y: 1.0,
            z: 1.0
          }
        },
        indexFile: {
          fileName: 'sector_1.i3d',
          peripheralFiles: [],
          estimatedDrawCallCount: 10,
          downloadSize: 19996
        },
        facesFile: {
          fileName: null,
          quadSize: 0.5,
          coverageFactors: {
            xy: 0.5,
            xz: 0.5,
            yz: 0.5
          },
          recursiveCoverageFactors: {
            xy: 0.5,
            xz: 0.5,
            yz: 0.5
          },
          downloadSize: 0
        }
      }
    ]
  };
  const retriever: ModelDataRetriever = {
    fetchJson: jest.fn(() => Promise.resolve(metadata)),
    fetchData: jest.fn()
  };
  const modelTransform: SectorModelTransformation = {
    modelMatrix: mat4.identity(mat4.create()),
    inverseModelMatrix: mat4.identity(mat4.create())
  };

  test('fetchSectorSimple() with valid ID, returns buffer', async () => {
    const model = await CadModelImpl.create(retriever, modelTransform);
    expect(model.fetchSectorSimple(SECTOR_ID_WITH_FACESFILE)).resolves.toBeTruthy();
  });

  test('fetchSectorSimple() with invalid ID, throws', async () => {
    const model = await CadModelImpl.create(retriever, modelTransform);
    expect(model.fetchSectorSimple(INVALID_SECTOR_ID)).rejects.toThrowError();
  });

  test('fetchSectorSimple() sector does not have facesFile, throws', async () => {
    const model = await CadModelImpl.create(retriever, modelTransform);
    expect(model.fetchSectorSimple(SECTOR_ID_WITHOUT_FACESFILE)).rejects.toThrowError();
  });

  test('fetchSectorDetailed() with valid ID, returns buffer', async () => {
    const model = await CadModelImpl.create(retriever, modelTransform);
    expect(model.fetchSectorDetailed(SECTOR_ID_WITH_FACESFILE)).resolves.toBeTruthy();
  });

  test('fetchSectorDetailed() with invalid ID, throws', async () => {
    const model = await CadModelImpl.create(retriever, modelTransform);
    expect(model.fetchSectorDetailed(INVALID_SECTOR_ID)).rejects.toThrowError();
  });
});
