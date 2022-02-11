/*!
 * Copyright 2022 Cognite AS
 */
import { GltfSectorLoader } from '../src/GltfSectorLoader';
import { BinaryFileProvider } from '@reveal/modeldata-api';
import { CadMaterialManager } from '@reveal/rendering';

import fs from 'fs';

import { IMock, Mock } from 'moq.ts';
import { V9SectorMetadata, WantedSector } from '@reveal/cad-parsers';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';

describe(GltfSectorLoader.name, () => {
  let fileBuffer: Buffer;

  let baseUrl: string;
  let wantedFile: string;
  let modelIdentifier: string;

  let loader: GltfSectorLoader;
  let wantedSectorMock: IMock<WantedSector>;

  beforeAll(() => {
    fileBuffer = fs.readFileSync(__dirname + '/test.glb');
  });

  beforeEach(() => {
    baseUrl = 'https://some_baseurl.com';
    wantedFile = 'wanted_file.glb';
    modelIdentifier = 'some_model_identifier';

    const binMock = new Mock<BinaryFileProvider>()
      .setup(p => p.getBinaryFile(baseUrl, wantedFile))
      .returnsAsync(fileBuffer.buffer);

    const mockedSectorMetadata = new Mock<V9SectorMetadata>().setup(p => p.sectorFileName).returns(wantedFile);

    wantedSectorMock = new Mock<WantedSector>()
      .setup(p => p.modelBaseUrl)
      .returns(baseUrl)
      .setup(p => p.modelIdentifier)
      .returns(modelIdentifier)
      .setup(p => p.metadata)
      .returns(mockedSectorMetadata.object());

    const materialManager = new CadMaterialManager();
    materialManager.addModelMaterials(modelIdentifier, 1);

    loader = new GltfSectorLoader(binMock.object(), materialManager);
  });

  test('loadSector returns consumed sector with right modelIdentifier', async () => {
    const consumedSector = await loader.loadSector(wantedSectorMock.object());

    expect(consumedSector.modelIdentifier).toBe(modelIdentifier);
  });

  test('loadSector returns sector with geometryBatchingQueue that contains all geometry types', async () => {
    const consumedSector = await loader.loadSector(wantedSectorMock.object());

    expect(consumedSector.geometryBatchingQueue).toBeTruthy();

    const typeSet = new Set<RevealGeometryCollectionType>();

    for (const geometry of consumedSector.geometryBatchingQueue!) {
      typeSet.add(geometry.type);
    }

    // Filter away numeric keys from enum, and subtract the two mesh types
    const numberOfPrimitives = Object.keys(RevealGeometryCollectionType).filter(k => isNaN(Number(k))).length - 2;

    expect(typeSet.size).toBe(numberOfPrimitives);
  });
});
