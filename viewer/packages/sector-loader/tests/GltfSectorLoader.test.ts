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
  let modelIdentifier: symbol;

  let loader: GltfSectorLoader;
  let wantedSectorMock: IMock<WantedSector>;

  beforeEach(() => {
    const binMock = createBinaryFileProviderMock();
    wantedSectorMock = createWantedSectorMock();
    modelIdentifier = wantedSectorMock.object().modelIdentifier.revealInternalId;

    const materialManager = new CadMaterialManager();
    materialManager.addModelMaterials(modelIdentifier, 1);

    loader = new GltfSectorLoader(binMock.object(), materialManager);
  });

  test('loadSector returns consumed sector with right id and modelIdentifier', async () => {
    const consumedSector = await loader.loadSector(wantedSectorMock.object());

    expect(consumedSector.modelIdentifier.revealInternalId).toBe(modelIdentifier);
    expect(consumedSector.metadata.id).toBe(wantedSectorMock.object().metadata.id);
  });

  test('loadSector returns sector with geometryBatchingQueue that contains all geometry types', async () => {
    const consumedSector = await loader.loadSector(wantedSectorMock.object());

    expect(consumedSector.geometryBatchingQueue).toBeTruthy();

    const typeSet = new Set<RevealGeometryCollectionType>();

    for (const geometry of consumedSector.geometryBatchingQueue!) {
      typeSet.add(geometry.type);
    }

    // Filter away numeric keys from enum, and subtract the three mesh types
    const numberOfPrimitives = Object.keys(RevealGeometryCollectionType).filter(k => isNaN(Number(k))).length - 3;

    expect(typeSet.size).toBe(numberOfPrimitives);
  });
});
