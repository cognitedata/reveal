/*!
 * Copyright 2026 Cognite AS
 */

import { describe, test, expect } from '@jest/globals';
import * as THREE from 'three';

import { TakenV9SectorMap } from './TakenV9SectorMap';
import { LevelOfDetail, SectorMetadata } from '@reveal/cad-parsers';
import { createCadModelMetadata, createV9SectorMetadata } from '../../../../../../test-utilities';
import { DetermineSectorCostDelegate, SectorCost } from '../types';

const stubSectorCost: DetermineSectorCostDelegate<SectorMetadata> = () => ({
  downloadSize: 1,
  drawCalls: 1,
  renderCost: 1
} as SectorCost);

function createMap(): { map: TakenV9SectorMap; model: ReturnType<typeof createCadModelMetadata> } {
  const root = createV9SectorMetadata([0, [], new THREE.Box3()]);
  const model = createCadModelMetadata(9, root);
  const map = new TakenV9SectorMap(stubSectorCost);
  map.initializeScene(model);
  return { map, model };
}

describe(TakenV9SectorMap.name, () => {
  test('markSectorForced marks sector as Detailed in collected sectors', () => {
    const { map, model } = createMap();
    const sectorId = model.scene.root.id;

    map.markSectorForced(model, sectorId);

    const wanted = map.collectWantedSectors();
    const forced = wanted.find(w => w.metadata.id === sectorId);
    expect(forced?.levelOfDetail).toBe(LevelOfDetail.Detailed);
  });

  test('markSectorForced sets Infinity priority', () => {
    const { map, model } = createMap();
    const sectorId = model.scene.root.id;

    map.markSectorForced(model, sectorId);

    const wanted = map.collectWantedSectors();
    const forced = wanted.find(w => w.metadata.id === sectorId);
    expect(forced?.priority).toBe(Infinity);
  });

  test('forced sector is included even when budget is zero', () => {
    const { map, model } = createMap();
    const sectorId = model.scene.root.id;

    map.markSectorForced(model, sectorId);

    expect(map.isWithinBudget({ maximumRenderCost: 0, highDetailProximityThreshold: 0 })).toBe(false);
    // Despite being over budget, the sector was still marked forced
    const wanted = map.collectWantedSectors();
    const forced = wanted.find(w => w.metadata.id === sectorId);
    expect(forced?.levelOfDetail).toBe(LevelOfDetail.Detailed);
  });

  test('markSectorForced with existing priority keeps Infinity', () => {
    const { map, model } = createMap();
    const sectorId = model.scene.root.id;

    map.markSectorDetailed(model, sectorId, 100);
    map.markSectorForced(model, sectorId);

    const wanted = map.collectWantedSectors();
    const forced = wanted.find(w => w.metadata.id === sectorId);
    expect(forced?.priority).toBe(Infinity);
  });

  test('computeSpentBudget counts forced sectors separately', () => {
    const { map, model } = createMap();
    const sectorId = model.scene.root.id;

    map.markSectorForced(model, sectorId);

    const spent = map.computeSpentBudget();
    expect(spent.forcedDetailedSectorCount).toBe(1);
  });
});
