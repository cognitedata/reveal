/*!
 * Copyright 2021 Cognite AS
 */

import type { ConsumedSector, WantedSector, CadModelMetadata } from '@reveal/cad-parsers';

import type { DetermineSectorsInput, DetermineSectorsPayload, SectorLoadingSpent } from './culling/types';
import type { SectorCuller } from './culling/SectorCuller';
import type { ModelStateHandler } from './ModelStateHandler';
import { chunk } from 'lodash-es';
import { PromiseUtils } from '../utilities/PromiseUtils';

import { File3dFormat } from '@reveal/data-providers';
import { SectorDownloadScheduler } from './SectorDownloadScheduler';
import type { CadNode } from '@reveal/cad-model';

/**
 * How many sectors to load per batch before doing another filtering pass, i.e. perform culling to determine
 * potential visible sectors.
 */
const SectorLoadingBatchSize = 20;

/**
 * Loads sector based on a given camera pose, a set of models and budget.
 * Uses {@link SectorCuller} to determine what to load, {@link SectorDownloadScheduler} to
 * load sectors and {@link ModelStateHandler} to keep track of what has been
 * loaded to avoid loading data that's already available.
 *
 * The caller is responsible for making the result from the load operation visible
 * on screen.
 */
export class SectorLoader {
  private readonly _modelStateHandler: ModelStateHandler;
  private readonly _progressHelper: ProgressReportHelper;
  private readonly _collectStatisticsCallback: (spent: SectorLoadingSpent) => void;
  private readonly _sectorCuller: SectorCuller;
  private readonly _continuousModelStreaming: boolean;
  private readonly _sectorDownloadScheduler: SectorDownloadScheduler;

  private _batchId = 0;

  constructor(
    sectorCuller: SectorCuller,
    modelStateHandler: ModelStateHandler,
    collectStatisticsCallback: (spent: SectorLoadingSpent) => void,
    progressCallback: (sectorsLoaded: number, sectorsScheduled: number, sectorsCulled: number) => void,
    continuousModelStreaming: boolean
  ) {
    this._sectorCuller = sectorCuller;

    this._sectorDownloadScheduler = new SectorDownloadScheduler(SectorLoadingBatchSize);

    this._modelStateHandler = modelStateHandler;
    this._collectStatisticsCallback = collectStatisticsCallback;
    this._progressHelper = new ProgressReportHelper(progressCallback);
    this._continuousModelStreaming = continuousModelStreaming;
  }

  async *loadSectors(input: DetermineSectorsPayload): AsyncIterable<ConsumedSector> {
    if (!this.shouldLoad(input)) {
      return [];
    }

    const cadModels = input.models;
    const visibleCadModels = cadModels.filter(x => x.visible && !x.isDisposed);

    const sectorCullerInput: DetermineSectorsInput = {
      ...input,
      cadModelsMetadata: visibleCadModels.map(x => x.cadModelMetadata),
      modelClippingPlanes: visibleCadModels.map(m => [...input.clippingPlanes, ...m.clippingPlanes]),
      lockedSectorIdsByModel: input.lockedSectorIdsByModel
    };

    if (sectorCullerInput.cadModelsMetadata.length <= 0) {
      return [];
    }

    const sectorCuller = this.getSectorCuller(sectorCullerInput);

    // Initial prioritization
    const prioritizedResult = sectorCuller.determineSectors(sectorCullerInput);
    this._collectStatisticsCallback(prioritizedResult.spentBudget);

    const hasSectorChanged = this._modelStateHandler.hasStateChanged.bind(this._modelStateHandler);

    const changedSectors = prioritizedResult.wantedSectors.filter(sector =>
      hasSectorChanged(sector.modelIdentifier.revealInternalId, sector.metadata.id, sector.levelOfDetail)
    );

    this._progressHelper.reset(changedSectors.length);

    this._batchId++;
    const currentBatchId = this._batchId;
    // Results from previous loads are discarded, so don't let their not-yet-started downloads delay this one
    this._sectorDownloadScheduler.clearQueuedDownloads();

    // A newer load has reset the progress helper and discards results from this one, so a superseded load
    // must neither report progress nor keep processing its remaining batches.
    const isSuperseded = () => currentBatchId !== this._batchId;

    const startBatch = async (batch: WantedSector[]): Promise<Promise<ConsumedSector>[]> => {
      if (isSuperseded()) {
        return [];
      }
      const filteredSectors = await sectorCuller.filterSectorsToLoad(sectorCullerInput, batch);
      if (isSuperseded()) {
        return [];
      }
      this._progressHelper.reportNewSectorsCulled(batch.length - filteredSectors.length);
      return this.startLoadingBatch(filteredSectors, cadModels);
    };

    const batches = chunk(changedSectors, SectorLoadingBatchSize);
    let loadingBatch = batches.length > 0 ? startBatch(batches[0]) : undefined;
    for (let i = 0; loadingBatch !== undefined; i++) {
      const consumedPromises = await loadingBatch;
      if (isSuperseded()) {
        return;
      }
      // Queue the next batch before consuming this one, so the download scheduler can start its sectors
      // as soon as a slot frees up instead of waiting for the slowest download in this batch.
      loadingBatch = i + 1 < batches.length ? startBatch(batches[i + 1]) : undefined;
      try {
        for await (const consumed of PromiseUtils.raceUntilAllCompleted(consumedPromises)) {
          if (isSuperseded()) {
            return;
          }
          const resolvedSector = consumed.result;
          if (resolvedSector !== undefined) {
            this._modelStateHandler.updateState(
              resolvedSector.modelIdentifier.revealInternalId,
              resolvedSector.metadata.id,
              resolvedSector.levelOfDetail
            );
            this._progressHelper.reportSectorYielded();
            yield resolvedSector; // progress will be reported when sector is loaded by CadManager
          } else {
            this._progressHelper.reportNewSectorsLoaded(1);
          }
        }
      } finally {
        // Don't leave the already queued next batch as an unhandled rejection if we stop early
        loadingBatch?.catch(() => {});
      }
    }
  }

  reportNewSectorsLoaded(loadedCountChange: number): void {
    this._progressHelper.reportYieldedSectorsLoaded(loadedCountChange);
  }

  private shouldLoad(input: DetermineSectorsPayload) {
    if (input.models.length == 0) {
      return false;
    }
    return this._continuousModelStreaming || !input.cameraInMotion;
  }

  private getSectorCuller(sectorCullerInput: DetermineSectorsInput): SectorCuller {
    if (isGltfModelFormat(sectorCullerInput.cadModelsMetadata[0])) {
      return this._sectorCuller;
    }
    throw new Error(`No supported sector culler for format ${sectorCullerInput.cadModelsMetadata[0].format}`);
  }

  private startLoadingBatch(batch: WantedSector[], models: CadNode[]): Promise<ConsumedSector>[] {
    const consumedPromises = batch.map(wantedSector => {
      const model = models.find(
        model =>
          model.cadModelMetadata.modelIdentifier.revealInternalId === wantedSector.modelIdentifier.revealInternalId
      );

      if (!model) {
        throw new Error(
          `Model not found for sector with identifier: ${wantedSector.modelIdentifier.revealInternalId.toString()}`
        );
      }

      return { sector: wantedSector, downloadSector: model.loadSector.bind(model) };
    });

    return this._sectorDownloadScheduler.queueSectorBatchForDownload(consumedPromises);
  }
}

class ProgressReportHelper {
  private readonly _progressCallback: (sectorsLoaded: number, sectorsScheduled: number, sectorsCulled: number) => void;
  private _sectorsScheduled = 0;
  private _sectorsLoaded = 0;
  private _sectorsCulled = 0;
  // Sectors handed to the consumer of the loader, which will report them as loaded
  private _sectorsAwaitingConsumer = 0;

  constructor(reportCb: (sectorsLoaded: number, sectorsScheduled: number, sectorsCulled: number) => void) {
    this._progressCallback = reportCb;
  }

  reset(sectorsScheduledChange: number) {
    // Superseded loads report nothing, so only sectors the consumer still has to report carry over
    this._sectorsScheduled = sectorsScheduledChange + this._sectorsAwaitingConsumer;
    this._sectorsLoaded = 0;
    this._sectorsCulled = 0;
    this.triggerCallback();
  }

  reportSectorYielded() {
    this._sectorsAwaitingConsumer++;
  }

  reportYieldedSectorsLoaded(loadedCountChange: number) {
    this._sectorsAwaitingConsumer = Math.max(0, this._sectorsAwaitingConsumer - loadedCountChange);
    this.reportNewSectorsLoaded(loadedCountChange);
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

function isGltfModelFormat(model: CadModelMetadata): boolean {
  // Add new versions here as support is added to Reveal
  const isGltf = model.format === File3dFormat.GltfCadModel || model.format === File3dFormat.GltfPrioritizedNodes;
  return isGltf && model.formatVersion === 9;
}
