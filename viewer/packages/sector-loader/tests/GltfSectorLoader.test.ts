/*!
 * Copyright 2022 Cognite AS
 */
import { GltfSectorLoader } from '../src/GltfSectorLoader';
import { CadMaterialManager } from '@reveal/rendering';

import { IMock } from 'moq.ts';
import { WantedSector } from '@reveal/cad-parsers';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import { createBinaryFileProviderMock, createWantedSectorMock } from './mockSectorUtils';

describe(GltfSectorLoader.name, () => {
  const modelIdentifier = 'some_model_identifier';

  let loader: GltfSectorLoader;
  let wantedSectorMock: IMock<WantedSector>;

  beforeEach(async () => {
    const binMock = createBinaryFileProviderMock();
    wantedSectorMock = createWantedSectorMock();

    const materialManager = new CadMaterialManager();
    materialManager.addModelMaterials(modelIdentifier, 1);

    loader = new GltfSectorLoader(binMock.object(), materialManager);
  });

  test('loadSector returns consumed sector with right id and modelIdentifier', async () => {
    const consumedSector = await loader.loadSector(wantedSectorMock.object());
    expect(consumedSector._unsafeUnwrap().modelIdentifier).toBe(modelIdentifier);
    expect(consumedSector._unsafeUnwrap().metadata.id).toBe(wantedSectorMock.object().metadata.id);
  });

  test('loadSector returns sector with geometryBatchingQueue that contains all geometry types', async () => {
    const consumedSector = await loader.loadSector(wantedSectorMock.object());

    expect(consumedSector._unsafeUnwrap().geometryBatchingQueue).toBeTruthy();

    const typeSet = new Set<RevealGeometryCollectionType>();

    for (const geometry of consumedSector._unsafeUnwrap().geometryBatchingQueue!) {
      typeSet.add(geometry.type);
    }

    // Filter away numeric keys from enum, and subtract the two mesh types
    const numberOfPrimitives = Object.keys(RevealGeometryCollectionType).filter(k => isNaN(Number(k))).length - 2;

    expect(typeSet.size).toBe(numberOfPrimitives);
  });
});
