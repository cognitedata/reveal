/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { CadModelBudget } from '../../../../public/types';

import {
  createCadModelMetadata,
  createDetermineSectorInput,
  createSectorMetadata
} from '../../../../__testutilities__';
import { CadModelMetadata } from '../../CadModelMetadata';
import { LevelOfDetail } from '../LevelOfDetail';
import { ByScreenSizeSectorCuller } from './ByScreenSizeSectorCuller';

describe('ByScreenSizeSectorCuller', () => {
  let camera: THREE.PerspectiveCamera;
  let model: CadModelMetadata;
  let budget: CadModelBudget;
  let allSectorsRenderCost: number;

  let culler: ByScreenSizeSectorCuller;

  beforeEach(() => {
    const root = createSectorMetadata([
      0,
      [
        [1, [], new THREE.Box3().setFromArray([-1, -1, 0, 0, 1])],
        [2, [], new THREE.Box3().setFromArray([0, -1, 1, 0, 0, 1])],
        [3, [], new THREE.Box3().setFromArray([-1, 0, 1, 0, 1, 1])],
        [4, [], new THREE.Box3().setFromArray([0, 0, 1, 1, 1, 1])]
      ],
      new THREE.Box3().setFromArray([-1, -1, -1, 1, 1, 1])
    ]);
    model = createCadModelMetadata(root);
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
      geometryDownloadSizeBytes: Infinity,
      maximumNumberOfDrawCalls: Infinity,
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
});
