/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { ByScreenSizeSectorCuller } from './ByScreenSizeSectorCuller';

import { CadModelMetadata, LevelOfDetail, WantedSector } from '@reveal/cad-parsers';

import { createCadModelMetadata, createV8SectorMetadata, createV9SectorMetadata } from '../../../../../test-utilities';
import { CadModelBudget } from '../../CadModelBudget';

import { createDetermineSectorInput } from './createDetermineSectorInput';

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
        [1, [], new THREE.Box3().setFromArray([-1, -1, 0, 0, 1])],
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

  test('determineSectors prioritizes sectors within budget', async () => {
    budget = { ...budget, maximumRenderCost: allSectorsRenderCost / 2.0 };
    const input = createDetermineSectorInput(camera, model, budget);

    const { wantedSectors, spentBudget } = await culler.determineSectors(input);
    const scheduledSectors = wantedSectors.filter(x => x.levelOfDetail !== LevelOfDetail.Discarded);

    expect(spentBudget.renderCost).toBeLessThan(allSectorsRenderCost);
    expect(spentBudget.renderCost).toBeGreaterThanOrEqual(budget.maximumRenderCost);
    expect(scheduledSectors.length).toBeLessThan(model.scene.sectorCount);
    expect(scheduledSectors.length).not.toBeEmpty();
  });

  test('determineSectors throws if model is not v9', () => {
    const v8input = createDetermineSectorInput(camera, createCadModelMetadata(8, createV8SectorMetadata([0, []])));
    expect(() => culler.determineSectors(v8input)).toThrowError();
  });

  test('determineSectors doesnt return fully culled sectors', async () => {
    budget = { ...budget, maximumRenderCost: allSectorsRenderCost / 2.0 };
    const input = createDetermineSectorInput(camera, model, budget);
    const clipPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), -0.5);
    input.clippingPlanes = [clipPlane];

    const { wantedSectors } = await culler.determineSectors(input);
    const scheduledSectors = wantedSectors.filter(x => x.levelOfDetail !== LevelOfDetail.Discarded);

    expect(scheduledSectors).toSatisfyAll((x: WantedSector) => {
      const bounds = x.metadata.subtreeBoundingBox;
      return clipPlane.intersectsBox(bounds);
    });
  });

  test('determineSectors prioritizes sectors intersecting prioritized areas', async () => {
    budget = { ...budget, maximumRenderCost: allSectorsRenderCost / 2.0 };
    const input = createDetermineSectorInput(camera, model, budget);
    const prioritizedAreaBounds = new THREE.Box3().setFromArray([0.5, 0.5, 0.5, 1.0, 1.0, 1.0]);
    const expectedTopPrioritySectors = model.scene.getSectorsIntersectingBox(prioritizedAreaBounds);
    input.prioritizedAreas = [{ area: prioritizedAreaBounds, extraPriority: 10 }];

    const { wantedSectors } = await culler.determineSectors(input);
    const scheduledSectors = wantedSectors.filter(x => x.levelOfDetail !== LevelOfDetail.Discarded);
    const topPrioritySectors = scheduledSectors.slice(0, expectedTopPrioritySectors.length);

    expect(topPrioritySectors).toSatisfyAll((x: WantedSector) => {
      const bounds = x.metadata.subtreeBoundingBox;
      return prioritizedAreaBounds.intersectsBox(bounds);
    });
  });
});
