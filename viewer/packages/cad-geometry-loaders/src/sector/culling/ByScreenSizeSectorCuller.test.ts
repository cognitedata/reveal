/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { ByScreenSizeSectorCuller } from './ByScreenSizeSectorCuller';

import { CadModelMetadata, LevelOfDetail, WantedSector } from '@reveal/cad-parsers';

import { createCadModelMetadata, createV9SectorMetadata } from '../../../../../test-utilities';
import { CadModelBudget } from '../../CadModelBudget';

import { createDetermineSectorInput } from './createDetermineSectorInput';
import { Mock } from 'moq.ts';
import { DetermineSectorsInput } from './types';

describe(ByScreenSizeSectorCuller.name, () => {
  let camera: THREE.PerspectiveCamera;
  let model: CadModelMetadata;
  let budget: CadModelBudget;
  let allSectorsRenderCost: number;

  let culler: ByScreenSizeSectorCuller;

  beforeEach(() => {
    const root = createV9SectorMetadata([
      0,
      [
        [1, [], new THREE.Box3().setFromArray([-1, -1, 0, 0, 1, 1])],
        [2, [], new THREE.Box3().setFromArray([0, -1, 1, 0, 0, 1])],
        [3, [], new THREE.Box3().setFromArray([-1, 0, 1, 0, 1, 1])],
        [4, [], new THREE.Box3().setFromArray([0, 0, 1, 1, 1, 1])]
      ],
      new THREE.Box3().setFromArray([-1, -1, -1, 1, 1, 1])
    ]);
    model = createCadModelMetadata(9, root);
    allSectorsRenderCost = model.scene.getAllSectors().reduce((sum, x) => sum + x.estimatedRenderCost, 0);

    camera = new THREE.PerspectiveCamera();
    camera.position.set(0, 0, 0);
    camera.near = 1.0;
    camera.far = 10.0;
    camera.lookAt(0, 0, 1);
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();

    culler = new ByScreenSizeSectorCuller();

    budget = {
      maximumRenderCost: 0,
      highDetailProximityThreshold: 0
    };
  });

  test('determineSectors prioritizes sectors within budget', () => {
    budget = { ...budget, maximumRenderCost: allSectorsRenderCost / 2.0 };
    const input = createDetermineSectorInput(camera, model, budget);

    const { wantedSectors, spentBudget } = culler.determineSectors(input);
    const scheduledSectors = wantedSectors.filter(x => x.levelOfDetail !== LevelOfDetail.Discarded);

    expect(spentBudget.renderCost).toBeLessThan(allSectorsRenderCost);
    expect(spentBudget.renderCost).toBeGreaterThanOrEqual(budget.maximumRenderCost);
    expect(scheduledSectors.length).toBeLessThan(model.scene.sectorCount);
    expect(scheduledSectors.length).not.toBeEmpty();
  });

  test('determineSectors throws if model is not v9', () => {
    const mockDetermineSectorInput = new Mock<DetermineSectorsInput>();
    expect(() => culler.determineSectors(mockDetermineSectorInput.object())).toThrowError();
  });

  test('determineSectors doesnt return fully culled sectors', () => {
    budget = { ...budget, maximumRenderCost: allSectorsRenderCost / 2.0 };
    const input = createDetermineSectorInput(camera, model, budget);
    const clipPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), -0.5);
    input.modelClippingPlanes = [[clipPlane]];

    const { wantedSectors } = culler.determineSectors(input);
    const scheduledSectors = wantedSectors.filter(x => x.levelOfDetail !== LevelOfDetail.Discarded);

    expect(scheduledSectors).toSatisfyAll((x: WantedSector) => {
      const bounds = x.metadata.subtreeBoundingBox;
      return clipPlane.intersectsBox(bounds);
    });
  });

  test('determineSectors prioritizes sectors intersecting prioritized areas', () => {
    budget = { ...budget, maximumRenderCost: allSectorsRenderCost / 2.0 };
    const input = createDetermineSectorInput(camera, model, budget);
    const prioritizedAreaBounds = new THREE.Box3().setFromArray([0.5, 0.5, 0.5, 1.0, 1.0, 1.0]);
    const expectedTopPrioritySectors = model.scene.getSectorsIntersectingBox(prioritizedAreaBounds);
    input.prioritizedAreas = [{ area: prioritizedAreaBounds, extraPriority: 10 }];

    const { wantedSectors } = culler.determineSectors(input);
    const scheduledSectors = wantedSectors.filter(x => x.levelOfDetail !== LevelOfDetail.Discarded);
    const topPrioritySectors = scheduledSectors.slice(0, expectedTopPrioritySectors.length);

    expect(topPrioritySectors).toSatisfyAll((x: WantedSector) => {
      const bounds = x.metadata.subtreeBoundingBox;
      return prioritizedAreaBounds.intersectsBox(bounds);
    });
  });

  test('determineSectors force-includes all sectors of a locked model even when budget is zero', () => {
    budget = { maximumRenderCost: 0, highDetailProximityThreshold: 0 };
    const input = createDetermineSectorInput(camera, model, budget);
    input.lockedModelIdentifiers = new Set([model.modelIdentifier.revealInternalId]);

    const { wantedSectors } = culler.determineSectors(input);
    const scheduled = wantedSectors.filter(x => x.levelOfDetail !== LevelOfDetail.Discarded);

    expect(scheduled.length).toBe(model.scene.sectorCount);
  });

  test('determineSectors force-includes specific locked sector IDs even when budget is zero', () => {
    budget = { maximumRenderCost: 0, highDetailProximityThreshold: 0 };
    const input = createDetermineSectorInput(camera, model, budget);
    const lockedSectorId = model.scene.root.id;
    input.lockedModelIdentifiers = new Set<symbol>();
    input.lockedSectorIdsByModel = new Map([[model.modelIdentifier.revealInternalId, new Set([lockedSectorId])]]);

    const { wantedSectors } = culler.determineSectors(input);
    const scheduled = wantedSectors.filter(x => x.levelOfDetail !== LevelOfDetail.Discarded);

    expect(scheduled.some(s => s.metadata.id === lockedSectorId)).toBe(true);
  });

  test('determineSectors does not force sectors for models not in lockedModelIdentifiers', () => {
    budget = { maximumRenderCost: 0, highDetailProximityThreshold: 0 };
    const input = createDetermineSectorInput(camera, model, budget);
    input.lockedModelIdentifiers = new Set<symbol>();
    input.lockedSectorIdsByModel = new Map();

    const { wantedSectors } = culler.determineSectors(input);
    const scheduled = wantedSectors.filter(x => x.levelOfDetail !== LevelOfDetail.Discarded);

    expect(scheduled.length).toBe(0);
  });
});
