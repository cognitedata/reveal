/*!
 * Copyright 2021 Cognite AS
 */

import { ConsumedSector, WantedSector, CadModelMetadata } from '@reveal/cad-parsers';

import { DetermineSectorsInput, DetermineSectorsPayload, SectorLoadingSpent } from './culling/types';
import { SectorCuller } from './culling/SectorCuller';
import { ModelStateHandler } from './ModelStateHandler';
import chunk from 'lodash/chunk';
import { PromiseUtils } from '../utilities/PromiseUtils';

import { File3dFormat } from '@reveal/data-providers';
import { SectorDownloadScheduler } from './SectorDownloadScheduler';
import { CadNode } from '@reveal/cad-model';

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
      modelClippingPlanes: visibleCadModels.map(m => [...input.clippingPlanes, ...m.clippingPlanes])
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

    for (const batch of chunk(changedSectors, SectorLoadingBatchSize)) {
      if (currentBatchId !== this._batchId) {
        // Stop processing this batch as a new batch has started, and will discard results from old batches.
        this._progressHelper.reportNewSectorsLoaded(batch.length);
        continue;
      }
      const filteredSectors = await this.filterSectors(sectorCullerInput, batch, sectorCuller, this._progressHelper);
      const consumedPromises = this.startLoadingBatch(filteredSectors, cadModels);
      for await (const consumed of PromiseUtils.raceUntilAllCompleted(consumedPromises)) {
        const resolvedSector = consumed.result;
        if (currentBatchId === this._batchId && resolvedSector !== undefined) {
          this._modelStateHandler.updateState(
            resolvedSector.modelIdentifier.revealInternalId,
            resolvedSector.metadata.id,
            resolvedSector.levelOfDetail
          );
          yield resolvedSector; // progress will be reported when sector is loaded by CadManager
        } else {
          this._progressHelper.reportNewSectorsLoaded(1);
        }
      }
    }
  }

  reportNewSectorsLoaded(loadedCountChange: number): void {
    this._progressHelper.reportNewSectorsLoaded(loadedCountChange);
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

  private async filterSectors(
    input: DetermineSectorsInput,
    batch: WantedSector[],
    sectorCuller: SectorCuller,
    progressHelper: ProgressReportHelper
  ): Promise<WantedSector[]> {
    // Determine if some of the sectors in the batch is culled by already loaded geometry
    const filteredSectors = await sectorCuller.filterSectorsToLoad(input, batch);
    progressHelper.reportNewSectorsCulled(batch.length - filteredSectors.length);
    return filteredSectors;
  }

  private startLoadingBatch(batch: WantedSector[], models: CadNode[]): Promise<ConsumedSector>[] {
    const consumedPromises = batch.map(wantedSector => {
      const model = models.filter(
        model =>
          model.cadModelMetadata.modelIdentifier.revealInternalId === wantedSector.modelIdentifier.revealInternalId
      )[0];
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

  constructor(reportCb: (sectorsLoaded: number, sectorsScheduled: number, sectorsCulled: number) => void) {
    this._progressCallback = reportCb;
  }

  reset(sectorsScheduledChange: number) {
    this._sectorsScheduled += sectorsScheduledChange - this._sectorsLoaded;
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

function isGltfModelFormat(model: CadModelMetadata): boolean {
  // Add new versions here as support is added to Reveal
  return model.format === File3dFormat.GltfCadModel && model.formatVersion === 9;
}
