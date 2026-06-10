/*!
 * Copyright 2021 Cognite AS
 */

import { PerspectiveCamera } from 'three';

import { asyncIteratorToArray, createCadModelMetadata, generateV9SectorTree } from '../../../../test-utilities';
import type { CadModelMetadata, SectorMetadata, ConsumedSector, WantedSector } from '@reveal/cad-parsers';
import { LevelOfDetail } from '@reveal/cad-parsers';
import type { ModelIdentifier } from '@reveal/data-providers';

import type { SectorCuller } from './culling/SectorCuller';
import type { DetermineSectorsInput, DetermineSectorsPayload, SectorLoadingSpent } from './culling/types';

import { ModelStateHandler } from './ModelStateHandler';
import type { SectorRepository } from '@reveal/sector-loader';
import { SectorLoader } from './SectorLoader';
import type { IMock } from 'moq.ts';
import { Mock } from 'moq.ts';
import { Log } from '@reveal/logger';
import type { LogLevelNumbers } from 'loglevel';
import type { CadNode } from '@reveal/cad-model';

import { vi } from 'vitest';

describe('SectorLoader', () => {
  let culler: SectorCuller;
  let repository: SectorRepository;
  let stateHandler: ModelStateHandler;
  let loader: SectorLoader;
  let collectStatisticsCallback: () => void;
  let progressCallback: () => void;
  let model: CadModelMetadata;
  let input: DetermineSectorsPayload;
  let cadNodeMock: IMock<CadNode>;
  let currentLogLevel: LogLevelNumbers;

  beforeAll(() => {
    const sectorRoot = generateV9SectorTree(2, 2);
    model = createCadModelMetadata(9, sectorRoot);
    currentLogLevel = Log.getLevel();
    Log.setLevel('silent');
  });

  afterAll(() => {
    Log.setLevel(currentLogLevel);
  });

  beforeEach(() => {
    culler = new StubSectorCuller();
    repository = new StubRepository();
    stateHandler = new ModelStateHandler();
    collectStatisticsCallback = vi.fn();
    progressCallback = vi.fn();

    cadNodeMock = new Mock<CadNode>()
      .setup(p => p.cadModelMetadata)
      .returns(model)
      .setup(p => p.visible)
      .returns(true)
      .setup(p => p.loadSector)
      .returns(value => repository.loadSector(value))
      .setup(p => p.clippingPlanes)
      .returns([]);

    input = {
      camera: new PerspectiveCamera(),
      budget: {
        highDetailProximityThreshold: 0,
        maximumRenderCost: 0
      },
      cameraInMotion: false,
      models: [cadNodeMock.object()],
      clippingPlanes: [],
      prioritizedAreas: [],
      loadingHints: {},
      lockedModelIdentifiers: new Set(),
      lockedSectorIdsByModel: new Map()
    };
    stateHandler.addModel(model.modelIdentifier.revealInternalId);
    loader = new SectorLoader(culler, stateHandler, collectStatisticsCallback, progressCallback, false);
  });

  test('loadSectors with no models, completes with no sectors', async () => {
    input.models = [];
    const result = await asyncIteratorToArray(loader.loadSectors(input));
    expect(result).toHaveLength(0);
  });

  test('loadSectors when cameraInMotion is true, completes with no sectors', async () => {
    input.cameraInMotion = true;
    const result = await asyncIteratorToArray(loader.loadSectors(input));
    expect(result).toHaveLength(0);
  });

  test('loadSectors when cameraInMotion is true, completes with no sectors', async () => {
    input.cameraInMotion = true;
    const result = await asyncIteratorToArray(loader.loadSectors(input));
    expect(result).toHaveLength(0);
  });

  test('loadSectors with single model returns sectors', async () => {
    const result = await asyncIteratorToArray(loader.loadSectors(input));
    expect(result).not.toHaveLength(0);
  });

  test('loadSectors updates sector state', async () => {
    const updateStateFn = vi.spyOn(stateHandler, 'updateState');

    for await (const _ of loader.loadSectors(input)) {
    }

    expect(updateStateFn).toHaveBeenCalledTimes(model.scene.sectorCount);
  });

  test('loadSectors only updates changed sectors', async () => {
    // Arrange
    const alreadyLoadedSector = createConsumedSector(createWantedSector(model, model.scene.root));
    stateHandler.updateState(
      alreadyLoadedSector.modelIdentifier.revealInternalId,
      alreadyLoadedSector.metadata.id,
      alreadyLoadedSector.levelOfDetail
    );
    const updateStateFn = vi.spyOn(stateHandler, 'updateState');

    // Act
    for await (const _ of loader.loadSectors(input)) {
    }

    // Assert
    expect(updateStateFn).toHaveBeenCalledTimes(model.scene.sectorCount - 1);
  });

  test('loadSectors marks sectors with errors as discarded', async () => {
    // Arrange
    let first = true;

    const cadNodeMock = new Mock<CadNode>()
      .setup(p => p.cadModelMetadata)
      .returns(model)
      .setup(p => p.visible)
      .returns(true)
      .setup(p => p.loadSector)
      .returns(value => {
        if (first) {
          first = false;
          return Promise.reject('Could not load sector');
        } else return repository.loadSector(value);
      })
      .setup(p => p.clippingPlanes)
      .returns([]);

    input.models = [cadNodeMock.object()];

    // Act
    const result = await asyncIteratorToArray(loader.loadSectors(input));

    // Assert
    const discarded = result.filter(x => x.levelOfDetail === LevelOfDetail.Discarded);
    expect(discarded.length).toBe(1);
  });
});

class StubRepository implements SectorRepository {
  loadSectorCallback: (sector: WantedSector) => ConsumedSector;

  constructor() {
    this.loadSectorCallback = createConsumedSector;
  }

  loadSector(sector: WantedSector): Promise<ConsumedSector> {
    return Promise.resolve(this.loadSectorCallback(sector));
  }
  clearCache(): void {}
  setCacheSize(_sectorCount: number): void {}
  dereferenceSector(_modelIdentifier: ModelIdentifier, _sectorId: number): void {}
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
  renderCost: 0,
  forcedDetailedSectorCount: 0,
  loadedSectorCount: 0,
  simpleSectorCount: 0,
  totalSectorCount: 0
};
