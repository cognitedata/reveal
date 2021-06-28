/*!
 * Copyright 2021 Cognite AS
 */
import { DetermineSectorsInput, SectorLoadingSpent } from './culling/types';
import { LevelOfDetail } from './LevelOfDetail';
import { SectorCuller } from './culling/SectorCuller';
import { ConsumedSector } from './types';
import { ModelStateHandler } from './ModelStateHandler';
import { Repository } from './Repository';
import chunk from 'lodash/chunk';

/**
 * How many sectors to load per batch before doing another filtering pass, i.e. perform culling to determine
 * potential visible sectors.
 */
export const SectorLoadingBatchSize = 20;

export class SectorLoader {
  private readonly _modelStateHandler: ModelStateHandler;
  private readonly _sectorCuller: SectorCuller;
  private readonly _sectorRepository: Repository;
  private readonly _progressCallback: (sectorsLoaded: number, sectorsScheduled: number, sectorsCulled: number) => void;
  private readonly _collectStatisticsCallback: (spent: SectorLoadingSpent) => void;

  constructor(
    sectorRepository: Repository,
    sectorCuller: SectorCuller,
    modelStateHandler: ModelStateHandler,
    collectStatisticsCallback: (spent: SectorLoadingSpent) => void,
    progressCallback: (sectorsLoaded: number, sectorsScheduled: number, sectorsCulled: number) => void
  ) {
    this._sectorRepository = sectorRepository;
    this._sectorCuller = sectorCuller;
    this._modelStateHandler = modelStateHandler;
    this._collectStatisticsCallback = collectStatisticsCallback;
    this._progressCallback = progressCallback;
  }

  async *determineSectors(input: DetermineSectorsInput): AsyncIterable<ConsumedSector> {
    if (input.cameraInMotion) {
      return [];
    }

    const collectStatisticsCallback = this._collectStatisticsCallback;
    const progressCallback = this._progressCallback;
    const sectorCuller = this._sectorCuller;
    const modelStateHandler = this._modelStateHandler;

    // Initial prioritization
    const prioritizedResult = sectorCuller.determineSectors(input);
    collectStatisticsCallback(prioritizedResult.spentBudget);

    let progress = 0;
    let culled = 0;
    function reportNewSectorsDone(newlyLoaded: number, newlyCulled: number) {
      progress += newlyLoaded + newlyCulled;
      culled += newlyCulled;
      progressCallback(progress, wantedSectorsCount, culled);
    }

    const modelStateChanged = modelStateHandler.hasStateChanged.bind(modelStateHandler);
    const changedSectors = prioritizedResult.wantedSectors.filter(modelStateChanged);
    const wantedSectorsCount = changedSectors.length;
    progressCallback(0, wantedSectorsCount, culled);

    for (const batch of chunk(changedSectors, SectorLoadingBatchSize)) {
      const filteredSectors = await sectorCuller.filterSectorsToLoad(input, batch);

      // We consider sectors that we no longer want to load as done, report progress
      const culledSectorsCount = batch.length - filteredSectors.length;
      reportNewSectorsDone(0, culledSectorsCount);

      const consumedPromises = filteredSectors.filter(modelStateChanged).map(async wantedSector => {
        try {
          const consumedSector = await this._sectorRepository.loadSector(wantedSector);
          return consumedSector;
        } catch (error) {
          // ts-ignore no-console
          console.error('Failed to load sector', wantedSector, 'error:', error);
          // Ignore error but mark sector as discarded since we didn't load any geometry
          const errorSector: ConsumedSector = {
            modelIdentifier: wantedSector.modelIdentifier,
            metadata: wantedSector.metadata,
            levelOfDetail: LevelOfDetail.Discarded,
            group: undefined,
            instancedMeshes: undefined
          };
          return errorSector;
        } finally {
          reportNewSectorsDone(1, 0);
        }
      });
      for (const consumed of consumedPromises) {
        // Return sectors to caller
        yield consumed;
      }
      for (const consumed of await Promise.all(consumedPromises)) {
        modelStateHandler.updateState(consumed);
      }
    }
  }
}
