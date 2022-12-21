/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { WantedSector, ConsumedSector, LevelOfDetail, SectorMetadata } from '@reveal/cad-parsers';
import { ModelStateHandler } from './ModelStateHandler';

describe('ModelStateHandler', () => {
  const { simple, detailed, discarded } = mockWantedSectors(1);

  test('addModel for already added model throws', () => {});
  const modelStateHandler = new ModelStateHandler();
  modelStateHandler.addModel('modelId');
  expect(() => modelStateHandler.addModel('modelId')).toThrowError();

  test('removeModel for model that isnt added throws', () => {
    const modelStateHandler = new ModelStateHandler();
    expect(() => modelStateHandler.removeModel('modelId')).toThrowError();
  });
  test('hasStateChanged triggered for model that has not been added, throws', () => {
    const modelStateHandler = new ModelStateHandler();
    expect(() => modelStateHandler.removeModel('modelId')).toThrowError();
  });

  test('hasStateChanged for added model, updates sectors', () => {
    const modelStateHandler = new ModelStateHandler();
    modelStateHandler.addModel(simple.modelIdentifier);
    const consumedSimple: ConsumedSector = { ...simple, group: undefined, instancedMeshes: undefined };

    modelStateHandler.updateState(
      consumedSimple.modelIdentifier,
      consumedSimple.metadata.id,
      consumedSimple.levelOfDetail
    );
    expect(modelStateHandler.hasStateChanged(simple.modelIdentifier, simple.metadata.id, simple.levelOfDetail)).toBe(
      false
    );

    const differentSectors: WantedSector[] = [detailed, discarded];
    differentSectors.forEach(wantedSector => {
      expect(
        modelStateHandler.hasStateChanged(
          wantedSector.modelIdentifier,
          wantedSector.metadata.id,
          wantedSector.levelOfDetail
        )
      ).toBe(true);
    });
  });

  test('updateState', () => {
    const modelStateHandler = new ModelStateHandler();
    modelStateHandler.addModel(simple.modelIdentifier);
    const sectors = [simple, detailed, discarded];
    sectors.forEach(wantedSector => {
      const consumedSector: ConsumedSector = { ...wantedSector, group: undefined, instancedMeshes: undefined };
      modelStateHandler.updateState(
        consumedSector.modelIdentifier,
        consumedSector.metadata.id,
        consumedSector.levelOfDetail
      );
      expect(
        modelStateHandler.hasStateChanged(
          wantedSector.modelIdentifier,
          wantedSector.metadata.id,
          wantedSector.levelOfDetail
        )
      ).toBe(false);
    });
  });
});

function mockWantedSectors(id: number): {
  simple: WantedSector;
  detailed: WantedSector;
  discarded: WantedSector;
} {
  const metadata: SectorMetadata = {
    id,
    path: '0/',
    depth: 0,
    subtreeBoundingBox: new THREE.Box3(),
    geometryBoundingBox: new THREE.Box3(),
    estimatedDrawCallCount: 0,
    estimatedRenderCost: 0,
    minDiagonalLength: 0.1,
    maxDiagonalLength: 1.0,
    sectorFileName: '0.glb',
    downloadSize: 1000,
    children: []
  };

  const modelIdentifier = 'modelIdentifer';
  const modelBaseUrl = 'https://localhost/';
  return {
    simple: { modelIdentifier, modelBaseUrl, metadata, levelOfDetail: LevelOfDetail.Simple, geometryClipBox: null },
    detailed: { modelIdentifier, modelBaseUrl, metadata, levelOfDetail: LevelOfDetail.Detailed, geometryClipBox: null },
    discarded: {
      modelIdentifier,
      modelBaseUrl,
      metadata,
      levelOfDetail: LevelOfDetail.Discarded,
      geometryClipBox: null
    }
  };
}
