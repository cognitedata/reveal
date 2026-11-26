/*!
 * Copyright 2021 Cognite AS
 */

import type { ConsumedSector, WantedSector, CadModelMetadata } from '@reveal/cad-parsers';
import { LevelOfDetail } from '@reveal/cad-parsers';

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

type LoadContext = {
  isSuperseded: () => boolean;
  sectorCuller: SectorCuller;
  sectorCullerInput: DetermineSectorsInput;
  models: CadNode[];
  /** Downloads this load may still yield, see {@link SectorLoader.releaseClaimedDownloads} */
  claimedDownloads: Set<Promise<ConsumedSector>>;
};

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

  /**
   * Every loaded sector holds a reference in the sector cache until it is shown and later discarded. Sectors that
   * no load yields are never shown, so their reference is released here. A download can be shared by several loads
   * (the download scheduler reuses in-flight downloads), so it is released only after the last load that may yield
   * it has stopped.
   */
  private readonly _downloadClaimCounts = new Map<Promise<ConsumedSector>, number>();
  /** Sectors that have been yielded or released, so their cache reference is accounted for */
  private readonly _handledSectors = new WeakSet<ConsumedSector>();

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
    // With an unlimited budget nothing has to be evicted to make room, so models that opt in keep
    // loaded sectors when they leave the view instead of unloading and later rebuilding them.
    // Turning this off does not unload kept sectors immediately; they are unloaded by the next sector
    // update, for example when the camera moves. Setting a limited budget starts such an update.
    const modelsKeepingLoadedSectors =
      input.budget.maximumRenderCost === Infinity
        ? new Set(
            visibleCadModels
              .filter(model => model.keepLoadedSectors)
              .map(model => model.cadModelMetadata.modelIdentifier.revealInternalId)
          )
        : new Set<symbol>();

    const changedSectors = prioritizedResult.wantedSectors.filter(
      sector =>
        !(
          sector.levelOfDetail === LevelOfDetail.Discarded &&
          modelsKeepingLoadedSectors.has(sector.modelIdentifier.revealInternalId)
        ) && hasSectorChanged(sector.modelIdentifier.revealInternalId, sector.metadata.id, sector.levelOfDetail)
    );

    this._progressHelper.reset(changedSectors.length);

    this._batchId++;
    const currentBatchId = this._batchId;
    // Results from previous loads are discarded, so don't let their not-yet-started downloads delay this one
    this._sectorDownloadScheduler.clearQueuedDownloads();

    // A newer load has reset the progress helper and discards results from this one, so a superseded load
    // must neither report progress nor keep processing its remaining batches.
    // A stopped load counts as superseded, so a batch that is still being culled when it stops claims nothing.
    let isStopped = false;
    const context: LoadContext = {
      isSuperseded: () => isStopped || currentBatchId !== this._batchId,
      sectorCuller,
      sectorCullerInput,
      models: cadModels,
      claimedDownloads: new Set()
    };

    try {
      const batches = chunk(changedSectors, SectorLoadingBatchSize);
      // Always keep the next batch started before consuming the current one, so the download scheduler can start
      // its sectors as soon as a slot frees up instead of waiting for the slowest download in the current batch.
      let nextBatch = batches.length > 0 ? this.startBatch(batches[0], context) : undefined;
      for (let i = 0; nextBatch !== undefined; i++) {
        const currentBatch = await nextBatch;
        if (context.isSuperseded()) {
          return;
        }
        nextBatch = i + 1 < batches.length ? this.startBatch(batches[i + 1], context) : undefined;
        // Avoid an unhandled rejection while the current batch is consumed. The error still surfaces at the next await.
        nextBatch?.catch(() => {});

        yield* this.consumeBatch(currentBatch, context);
      }
    } finally {
      isStopped = true;
      this.releaseClaimedDownloads(context);
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

  /**
   * Culls the batch against already loaded geometry and queues the remaining sectors for download.
   * Resolves to no downloads if the load is superseded.
   */
  private async startBatch(batch: WantedSector[], context: LoadContext): Promise<Promise<ConsumedSector>[]> {
    if (context.isSuperseded()) {
      return [];
    }
    const filteredSectors = await context.sectorCuller.filterSectorsToLoad(context.sectorCullerInput, batch);
    // The load may have been superseded while culling
    if (context.isSuperseded()) {
      return [];
    }
    this._progressHelper.reportNewSectorsCulled(batch.length - filteredSectors.length);
    const downloads = this.startLoadingBatch(filteredSectors, context.models);
    downloads.forEach(download => this.claimDownload(download, context));
    return downloads;
  }

  private claimDownload(download: Promise<ConsumedSector>, context: LoadContext): void {
    if (context.claimedDownloads.has(download)) {
      return;
    }
    context.claimedDownloads.add(download);
    this._downloadClaimCounts.set(download, (this._downloadClaimCounts.get(download) ?? 0) + 1);
  }

  /**
   * Called when a load stops. Releases the cache reference of every download that neither this nor any other
   * load yields.
   */
  private releaseClaimedDownloads(context: LoadContext): void {
    for (const download of context.claimedDownloads) {
      const remainingClaims = (this._downloadClaimCounts.get(download) ?? 1) - 1;
      if (remainingClaims > 0) {
        this._downloadClaimCounts.set(download, remainingClaims);
        continue;
      }
      this._downloadClaimCounts.delete(download);
      download.then(sector => {
        // A newer load may have claimed the download while it was in flight
        if (this._downloadClaimCounts.has(download) || this._handledSectors.has(sector)) {
          return;
        }
        this._handledSectors.add(sector);
        const model = context.models.find(
          model => model.cadModelMetadata.modelIdentifier.revealInternalId === sector.modelIdentifier.revealInternalId
        );
        model?.releaseUnusedSector(sector);
      });
    }
    context.claimedDownloads.clear();
  }

  /**
   * Yields the sectors of a batch as they finish downloading, and reports progress.
   * Stops as soon as the load is superseded.
   */
  private async *consumeBatch(
    consumedPromises: Promise<ConsumedSector>[],
    context: LoadContext
  ): AsyncGenerator<ConsumedSector> {
    for await (const consumed of PromiseUtils.raceUntilAllCompleted(consumedPromises)) {
      if (context.isSuperseded()) {
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
        // The consumer takes over the cache reference of a yielded sector
        this._handledSectors.add(resolvedSector);
        yield resolvedSector; // progress will be reported when sector is loaded by CadManager
      } else {
        this._progressHelper.reportNewSectorsLoaded(1);
      }
    }
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
