/*!
 * Copyright 2026 Cognite AS
 */

import { TakenV9SectorMap } from './TakenV9SectorMap';
import type { SectorMetadata } from '@reveal/cad-parsers';
import { LevelOfDetail } from '@reveal/cad-parsers';
import { createCadModelMetadata, createV9SectorMetadata } from '../../../../../../test-utilities';
import type { DetermineSectorCostDelegate, SectorCost } from '../types';
import { Box3 } from 'three';

const stubSectorCost: DetermineSectorCostDelegate<SectorMetadata> = () =>
  ({
    downloadSize: 1,
    drawCalls: 1,
    renderCost: 1
  }) satisfies SectorCost;

function createMap(): { map: TakenV9SectorMap; model: ReturnType<typeof createCadModelMetadata> } {
  const root = createV9SectorMetadata([0, [], new Box3()]);
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

  test('forced sector cost does not count against the budget', () => {
    const { map, model } = createMap();

    map.markSectorForced(model, model.scene.root.id);

    // Stub cost is 1 per sector, so a budget of 1 would be exhausted if forced cost counted
    expect(map.isWithinBudget({ maximumRenderCost: 1, highDetailProximityThreshold: 0 })).toBe(true);
  });

  test('sector taken normally and then forced no longer counts against the budget', () => {
    const { map, model } = createMap();
    const sectorId = model.scene.root.id;

    map.markSectorDetailed(model, sectorId, 100);
    expect(map.isWithinBudget({ maximumRenderCost: 1, highDetailProximityThreshold: 0 })).toBe(false);

    map.markSectorForced(model, sectorId);
    expect(map.isWithinBudget({ maximumRenderCost: 1, highDetailProximityThreshold: 0 })).toBe(true);
  });

  test('forcing the same sector twice does not double-discount cost', () => {
    const { map, model } = createMap();
    const sectorId = model.scene.root.id;

    map.markSectorForced(model, sectorId);
    map.markSectorForced(model, sectorId);

    expect(map.totalCost.renderCost).toBe(1);
    expect(map.isWithinBudget({ maximumRenderCost: 1, highDetailProximityThreshold: 0 })).toBe(true);
  });
});
