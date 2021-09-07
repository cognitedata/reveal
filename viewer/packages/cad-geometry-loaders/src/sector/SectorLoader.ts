/*!
 * Copyright 2021 Cognite AS
 */
import { DetermineSectorsInput, SectorLoadingSpent } from './culling/types';
import { LevelOfDetail } from './LevelOfDetail';
import { SectorCuller } from './culling/SectorCuller';
import { ConsumedSector, WantedSector } from './types';
import { ModelStateHandler } from './ModelStateHandler';
import { Repository } from './Repository';
import chunk from 'lodash/chunk';
import { PromiseUtils } from '../utilities/PromiseUtils';

/**
 * How many sectors to load per batch before doing another filtering pass, i.e. perform culling to determine
 * potential visible sectors.
 */
const SectorLoadingBatchSize = 20;

/**
 * Loads sector based on a given camera pose, a set of models and budget.
 * Uses {@link SectorCuller} to determine what to load, {@link Repository} to
 * load sectors and {@link ModelStateHandler} to keep track of what has been
 * loaded to avoid loading data that's already available.
 *
 * The caller is responsible for making the result from the load operation visible
 * on screen.
 */
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

  async *loadSectors(input: DetermineSectorsInput): AsyncIterable<ConsumedSector> {
    if (input.cameraInMotion) {
      return [];
    }

    // Initial prioritization
    const prioritizedResult = this._sectorCuller.determineSectors(input);
    this._collectStatisticsCallback(prioritizedResult.spentBudget);

    const hasSectorChanged = this._modelStateHandler.hasStateChanged.bind(this._modelStateHandler);
    const changedSectors = prioritizedResult.wantedSectors.filter(hasSectorChanged);

    const progressHelper = new ProgressReportHelper(this._progressCallback);
    progressHelper.start(changedSectors.length);

    for (const batch of chunk(changedSectors, SectorLoadingBatchSize)) {
      const filtered = await this.filterSectors(input, batch, progressHelper);
      const consumedPromises = this.startLoadingBatch(filtered, progressHelper);

      for await (const consumed of PromiseUtils.raceUntilAllCompleted(consumedPromises)) {
        this._modelStateHandler.updateState(consumed);
        yield consumed;
      }
    }
  }

  private async filterSectors(
    input: DetermineSectorsInput,
    batch: WantedSector[],
    progressHelper: ProgressReportHelper
  ): Promise<WantedSector[]> {
    // Determine if some of the sectors in the batch is culled by already loaded geometry
    const filteredSectors = await this._sectorCuller.filterSectorsToLoad(input, batch);
    progressHelper.reportNewSectorsCulled(batch.length - filteredSectors.length);
    return filteredSectors;
  }

  private startLoadingBatch(batch: WantedSector[], progressHelper: ProgressReportHelper): Promise<ConsumedSector>[] {
    const consumedPromises = batch.map(async wantedSector => {
      try {
        const consumedSector = await this._sectorRepository.loadSector(wantedSector);
        return consumedSector;
      } catch (error) {
        // ts-ignore no-console
        console.error('Failed to load sector', wantedSector, 'error:', error);
        // Ignore error but mark sector as discarded since we didn't load any geometry
        const errorSector = makeErrorSector(wantedSector);
        return errorSector;
      } finally {
        progressHelper.reportNewSectorsLoaded(1);
      }
    });
    return consumedPromises;
  }
}

function makeErrorSector(wantedSector: WantedSector): ConsumedSector {
  return {
    modelIdentifier: wantedSector.modelIdentifier,
    metadata: wantedSector.metadata,
    levelOfDetail: LevelOfDetail.Discarded,
    group: undefined,
    instancedMeshes: undefined
  };
}

class ProgressReportHelper {
  private readonly _progressCallback: (sectorsLoaded: number, sectorsScheduled: number, sectorsCulled: number) => void;
  private _sectorsScheduled = 0;
  private _sectorsLoaded = 0;
  private _sectorsCulled = 0;

  constructor(reportCb: (sectorsLoaded: number, sectorsScheduled: number, sectorsCulled: number) => void) {
    this._progressCallback = reportCb;
  }

  start(sectorsScheduled: number) {
    this._sectorsScheduled = sectorsScheduled;
    this._sectorsLoaded = 0;
    this._sectorsCulled = 0;
    this.triggerCallback();
  }

  reportNewSectorsLoaded(loadedCountChange: number) {
    this._sectorsLoaded += loadedCountChange;
    this.triggerCallback();
  }

  reportNewSectorsCulled(culledCountChange: number) {
    this._sectorsCulled += culledCountChange;
    this._sectorsLoaded += culledCountChange;
    this.triggerCallback();
  }

  private triggerCallback() {
    this._progressCallback(this._sectorsLoaded, this._sectorsScheduled, this._sectorsCulled);
  }
}
