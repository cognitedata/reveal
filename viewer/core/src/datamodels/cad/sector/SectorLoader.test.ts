/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { AutoDisposeGroup } from '../../../utilities/three';
import { generateSectorTree, asyncIteratorToArray, createCadModelMetadata } from '../../../../../test-utilities';
import { CadModelMetadata, SectorMetadata } from '@reveal/cad-parsers';

import { SectorCuller } from './culling/SectorCuller';
import { DetermineSectorsInput, SectorLoadingSpent } from './culling/types';
import { LevelOfDetail } from './LevelOfDetail';

import { ModelStateHandler } from './ModelStateHandler';
import { Repository } from './Repository';
import { SectorLoader } from './SectorLoader';
import { ConsumedSector, WantedSector } from './types';

describe('SectorLoader', () => {
  let culler: SectorCuller;
  let repository: Repository;
  let stateHandler: ModelStateHandler;
  let loader: SectorLoader;
  let collectStatisticsCallback: () => void;
  let progressCallback: () => void;
  let model: CadModelMetadata;
  let input: DetermineSectorsInput;

  beforeAll(() => {
    const sectorRoot = generateSectorTree(2, 2);
    model = createCadModelMetadata(sectorRoot);
  });

  beforeEach(() => {
    culler = new StubSectorCuller();
    repository = new StubRepository();
    stateHandler = new ModelStateHandler();
    collectStatisticsCallback = jest.fn();
    progressCallback = jest.fn();

    input = {
      camera: new THREE.PerspectiveCamera(),
      budget: { geometryDownloadSizeBytes: 0, highDetailProximityThreshold: 0, maximumNumberOfDrawCalls: 0 },
      cameraInMotion: false,
      cadModelsMetadata: [model],
      clippingPlanes: [],
      loadingHints: {}
    };
    stateHandler.addModel(model.modelIdentifier);

    loader = new SectorLoader(repository, culler, stateHandler, collectStatisticsCallback, progressCallback);
  });

  test('loadSectors with no models, completes with no sectors', async () => {
    input.cadModelsMetadata = [];
    const result = await asyncIteratorToArray(loader.loadSectors(input));
    expect(result).toBeEmpty();
  });

  test('loadSectors when cameraInMotion is true, completes with no sectors', async () => {
    input.cameraInMotion = true;
    const result = await asyncIteratorToArray(loader.loadSectors(input));
    expect(result).toBeEmpty();
  });

  test('loadSectors when cameraInMotion is true, completes with no sectors', async () => {
    input.cameraInMotion = true;
    const result = await asyncIteratorToArray(loader.loadSectors(input));
    expect(result).toBeEmpty();
  });

  test('loadSectors with single model returns sectors', async () => {
    const result = await asyncIteratorToArray(loader.loadSectors(input));
    expect(result).not.toBeEmpty();
  });

  test('loadSectors updates sector state', async () => {
    const updateStateFn = jest.spyOn(stateHandler, 'updateState');

    for await (const _ of loader.loadSectors(input)) {
    }

    expect(updateStateFn).toBeCalledTimes(model.scene.sectorCount);
  });

  test('loadSectors only updates changed sectors', async () => {
    // Arrange
    const alreadyLoadedSector = createConsumedSector(createWantedSector(model, model.scene.root));
    stateHandler.updateState(alreadyLoadedSector);
    const updateStateFn = jest.spyOn(stateHandler, 'updateState');

    // Act
    for await (const _ of loader.loadSectors(input)) {
    }

    // Assert
    expect(updateStateFn).toBeCalledTimes(model.scene.sectorCount - 1);
  });

  test('loadSectors marks sectors with errors as discarded', async () => {
    // Arrange
    jest.spyOn(repository, 'loadSector').mockRejectedValueOnce(new Error('error'));

    // Act
    const result = await asyncIteratorToArray(loader.loadSectors(input));

    // Assert
    const discarded = result.filter(x => x.levelOfDetail === LevelOfDetail.Discarded);
    expect(discarded.length).toBe(1);
  });
});

class StubRepository implements Repository {
  loadSectorCallback: (sector: WantedSector) => ConsumedSector;

  constructor() {
    this.loadSectorCallback = createConsumedSector;
  }

  loadSector(sector: WantedSector): Promise<ConsumedSector> {
    return Promise.resolve(this.loadSectorCallback(sector));
  }
  clear(): void {}
}

class StubSectorCuller implements SectorCuller {
  filterCallback: (sector: WantedSector) => boolean = () => true;

  determineSectors(input: DetermineSectorsInput): { wantedSectors: WantedSector[]; spentBudget: SectorLoadingSpent } {
    const wantedSectors: WantedSector[] = input.cadModelsMetadata.flatMap(model =>
      model.scene.getAllSectors().map(s => createWantedSector(model, s))
    );
    return { wantedSectors, spentBudget: noBudget };
  }

  filterSectorsToLoad(_input: DetermineSectorsInput, wantedSectorsBatch: WantedSector[]): Promise<WantedSector[]> {
    return Promise.resolve(wantedSectorsBatch.filter(x => this.filterCallback(x)));
  }

  dispose(): void {}
}

function createWantedSector(model: CadModelMetadata, sector: SectorMetadata): WantedSector {
  const wanted: WantedSector = {
    geometryClipBox: model.geometryClipBox,
    levelOfDetail: LevelOfDetail.Detailed,
    metadata: sector,
    modelBaseUrl: model.modelBaseUrl,
    modelIdentifier: model.modelIdentifier
  };
  return wanted;
}

function createConsumedSector(sector: WantedSector): ConsumedSector {
  const consumed: ConsumedSector = {
    group: new AutoDisposeGroup(),
    instancedMeshes: [],
    levelOfDetail: sector.levelOfDetail,
    metadata: sector.metadata,
    modelIdentifier: sector.modelIdentifier
  };
  return consumed;
}

const noBudget: SectorLoadingSpent = {
  downloadSize: 0,
  accumulatedPriority: 0,
  detailedSectorCount: 0,
  drawCalls: 0,
  forcedDetailedSectorCount: 0,
  loadedSectorCount: 0,
  simpleSectorCount: 0,
  totalSectorCount: 0
};
