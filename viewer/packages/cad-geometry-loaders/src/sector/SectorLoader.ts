/*!
 * Copyright 2021 Cognite AS
 */

import { ConsumedSector, WantedSector, LevelOfDetail, CadModelMetadata } from '@reveal/cad-parsers';

import { DetermineSectorsInput, DetermineSectorsPayload, SectorLoadingSpent } from './culling/types';
import { SectorCuller } from './culling/SectorCuller';
import { ModelStateHandler } from './ModelStateHandler';
import chunk from 'lodash/chunk';
import { PromiseUtils } from '../utilities/PromiseUtils';
import { ByScreenSizeSectorCuller } from './culling/ByScreenSizeSectorCuller';

import log from '@reveal/logger';
import { CadNode } from '@reveal/rendering';
import { File3dFormat } from '@reveal/modeldata-api';

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
  private readonly _v8SectorCuller: SectorCuller;
  private readonly _progressCallback: (sectorsLoaded: number, sectorsScheduled: number, sectorsCulled: number) => void;
  private readonly _collectStatisticsCallback: (spent: SectorLoadingSpent) => void;
  private readonly _gltfSectorCuller: SectorCuller;

  constructor(
    sectorCuller: SectorCuller,
    modelStateHandler: ModelStateHandler,
    collectStatisticsCallback: (spent: SectorLoadingSpent) => void,
    progressCallback: (sectorsLoaded: number, sectorsScheduled: number, sectorsCulled: number) => void
  ) {
    // TODO: add runtime initialization of culler and inject
    // the proper sector culler (create factory)
    this._v8SectorCuller = sectorCuller;
    this._gltfSectorCuller = new ByScreenSizeSectorCuller();

    this._modelStateHandler = modelStateHandler;
    this._collectStatisticsCallback = collectStatisticsCallback;
    this._progressCallback = progressCallback;
  }

  async *loadSectors(input: DetermineSectorsPayload): AsyncIterable<ConsumedSector> {
    if (input.cameraInMotion) {
      return [];
    }

    const cadModels = input.models;

    const sectorCullerInput: DetermineSectorsInput = {
      ...input,
      cadModelsMetadata: cadModels.filter(x => x.visible).map(x => x.cadModelMetadata)
    };

    if (sectorCullerInput.cadModelsMetadata.length <= 0) {
      return [];
    }

    const sectorCuller = this.getSectorCuller(sectorCullerInput);

    // Initial prioritization
    const prioritizedResult = sectorCuller.determineSectors(sectorCullerInput);
    this._collectStatisticsCallback(prioritizedResult.spentBudget);

    const hasSectorChanged = this._modelStateHandler.hasStateChanged.bind(this._modelStateHandler);
    const changedSectors = prioritizedResult.wantedSectors.filter(hasSectorChanged);

    const progressHelper = new ProgressReportHelper(this._progressCallback);
    progressHelper.start(changedSectors.length);

    for (const batch of chunk(changedSectors, SectorLoadingBatchSize)) {
      const filteredSectors = await this.filterSectors(sectorCullerInput, batch, sectorCuller, progressHelper);
      const consumedPromises = this.startLoadingBatch(filteredSectors, progressHelper, cadModels);
      for await (const consumed of PromiseUtils.raceUntilAllCompleted(consumedPromises)) {
        this._modelStateHandler.updateState(consumed);
        yield consumed;
      }
    }
  }

  private getSectorCuller(sectorCullerInput: DetermineSectorsInput): SectorCuller {
    let sectorCuller: SectorCuller;

    if (isLegacyModelFormat(sectorCullerInput.cadModelsMetadata[0])) {
      return this._v8SectorCuller;
    } else if (isGltfModelFormat(sectorCullerInput.cadModelsMetadata[0])) {
      return this._gltfSectorCuller;
    } else {
      throw new Error(`No supported sector culler for format ${sectorCullerInput.cadModelsMetadata[0].format}`);
    }
    return sectorCuller;
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

  private startLoadingBatch(
    batch: WantedSector[],
    progressHelper: ProgressReportHelper,
    models: CadNode[]
  ): Promise<ConsumedSector>[] {
    const consumedPromises = batch.map(async wantedSector => {
      try {
        const model = models.filter(
          model => model.cadModelMetadata.modelIdentifier === wantedSector.modelIdentifier
        )[0];
        return model.loadSector(wantedSector);
      } catch (error) {
        log.error('Failed to load sector', wantedSector, 'error:', error);
        // Ignore error but mark sector as discarded since we didn't load any geometry
        return {
          modelIdentifier: wantedSector.modelIdentifier,
          metadata: wantedSector.metadata,
          levelOfDetail: LevelOfDetail.Discarded,
          group: undefined,
          instancedMeshes: undefined
        };
      } finally {
        progressHelper.reportNewSectorsLoaded(1);
      }
    });
    return consumedPromises;
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

function isLegacyModelFormat(model: CadModelMetadata): boolean {
  return model.format === File3dFormat.RevealCadModel && model.formatVersion === 8;
}

function isGltfModelFormat(model: CadModelMetadata): boolean {
  return (
    (model.format === File3dFormat.RevealCadModel && model.formatVersion >= 9) ||
    model.format === File3dFormat.GltfCadModel
  );
}
