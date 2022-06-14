/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { AutoDisposeGroup } from '@reveal/utilities';
import { asyncIteratorToArray, createCadModelMetadata, generateV8SectorTree } from '../../../../test-utilities';
import { CadModelMetadata, SectorMetadata, LevelOfDetail, ConsumedSector, WantedSector } from '@reveal/cad-parsers';

import { SectorCuller } from './culling/SectorCuller';
import { DetermineSectorsInput, DetermineSectorsPayload, SectorLoadingSpent } from './culling/types';

import { ModelStateHandler } from './ModelStateHandler';
import { SectorRepository } from '@reveal/sector-loader';
import { SectorLoader } from './SectorLoader';
import { IMock, Mock } from 'moq.ts';
import Log from '@reveal/logger';
import { LogLevelNumbers } from 'loglevel';
import { CadNode } from '@reveal/cad-model';

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
    const sectorRoot = generateV8SectorTree(2, 2);
    model = createCadModelMetadata(8, sectorRoot);
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
    collectStatisticsCallback = jest.fn();
    progressCallback = jest.fn();

    cadNodeMock = new Mock<CadNode>()
      .setup(p => p.cadModelMetadata)
      .returns(model)
      .setup(p => p.visible)
      .returns(true)
      .setup(p => p.loadSector)
      .returns(value => repository.loadSector(value));

    input = {
      camera: new THREE.PerspectiveCamera(),
      budget: {
        highDetailProximityThreshold: 0,
        maximumRenderCost: 0
      },
      cameraInMotion: false,
      models: [cadNodeMock.object()],
      clippingPlanes: [],
      prioritizedAreas: [],
      loadingHints: {}
    };
    stateHandler.addModel(model.modelIdentifier);
    loader = new SectorLoader(culler, stateHandler, collectStatisticsCallback, progressCallback, false);
  });

  test('loadSectors with no models, completes with no sectors', async () => {
    input.models = [];
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
    stateHandler.updateState(
      alreadyLoadedSector.modelIdentifier,
      alreadyLoadedSector.metadata.id,
      alreadyLoadedSector.levelOfDetail
    );
    const updateStateFn = jest.spyOn(stateHandler, 'updateState');

    // Act
    for await (const _ of loader.loadSectors(input)) {
    }

    // Assert
    expect(updateStateFn).toBeCalledTimes(model.scene.sectorCount - 1);
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
      });

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
  renderCost: 0,
  forcedDetailedSectorCount: 0,
  loadedSectorCount: 0,
  simpleSectorCount: 0,
  totalSectorCount: 0
};
