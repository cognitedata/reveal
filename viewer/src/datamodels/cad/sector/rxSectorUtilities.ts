/*!
 * Copyright 2021 Cognite AS
 */

import { DetermineSectorsInput, SectorLoadingSpendage } from './culling/types';
import { LevelOfDetail } from './LevelOfDetail';
import { SectorCuller } from './culling/SectorCuller';
import { OperatorFunction, from, Observable, asyncScheduler, EMPTY } from 'rxjs';
import { ConsumedSector, WantedSector } from './types';
import { ModelStateHandler } from './ModelStateHandler';
import { Repository } from './Repository';
import { filter, switchMap, tap, publish, subscribeOn, bufferCount, mergeMap } from 'rxjs/operators';

/**
 * How many sectors to load per batch before doing another filtering pass, i.e. perform culling to determing
 * potential visibile sectors.
 */
const SectorLoadingBatchSize = 20;

/**
 * Creates a RxJS operator for loading sectors given camera, budget etc input.
 * @param sectorRepository Repository to store sectors in
 * @param sectorCuller Culler used to prioritize sectors for loading
 * @param modelStateHandler Holds state about what sectors are loaded
 * @param collectStatisticsCallback Callback to collect statistics on how much data is loaded
 * @returns RxJS operator
 */
export function handleDetermineSectorsInput(
  sectorRepository: Repository,
  sectorCuller: SectorCuller,
  modelStateHandler: ModelStateHandler,
  collectStatisticsCallback: (spendage: SectorLoadingSpendage) => void,
  progressCallback: (sectorsLoaded: number, sectorsScheduled: number, sectorsCulled: number) => void
): OperatorFunction<DetermineSectorsInput, ConsumedSector> {
  return publish((source$: Observable<DetermineSectorsInput>) => {
    const updateSector = (input: DetermineSectorsInput) => {
      const { cameraInMotion } = input;
      if (cameraInMotion) {
        return EMPTY;
      }
      // Initial prioritization
      const prioritizedResult = sectorCuller.determineSectors(input);
      collectStatisticsCallback(prioritizedResult.spendage);

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

      return from(changedSectors).pipe(
        subscribeOn(asyncScheduler),
        bufferCount(SectorLoadingBatchSize),
        mergeMap(batch => {
          const filteredSectorsPromise = sectorCuller.filterSectorsToLoad(input, batch);
          return from(filteredSectorsPromise).pipe(
            subscribeOn(asyncScheduler),
            tap(filtered => {
              // We consider sectors that we no longer want to load as done, report progress
              reportNewSectorsDone(0, batch.length - filtered.length);
            }),
            mergeMap(filtered => filtered), // flatten array (WantedSector[] -> WantedSector)
            filter(modelStateChanged),
            mergeMap(async x => {
              try {
                const consumedSector = await sectorRepository.loadSector(x);
                return consumedSector;
              } catch (error) {
                // Ignore error but mark sector as discarded since we didn't load any geometry
                const errorSector: ConsumedSector = {
                  modelIdentifier: x.modelIdentifier,
                  metadata: x.metadata,
                  levelOfDetail: LevelOfDetail.Discarded,
                  group: undefined,
                  instancedMeshes: undefined
                };
                return errorSector;
              } finally {
                reportNewSectorsDone(1, 0);
              }
            })
          );
        }, 1)
      );
    };

    return source$.pipe(switchMap(updateSector)).pipe(
      tap({
        next: modelStateHandler.updateState.bind(modelStateHandler)
      })
    );
  });
}

export function filterSectorBatch(batch: WantedSector[]): WantedSector[] {
  return batch;
}

export function loadingEnabled({ cadModelsMetadata, loadingHints }: DetermineSectorsInput) {
  return cadModelsMetadata.length > 0 && loadingHints.suspendLoading !== true;
}

export interface ModelState {
  [id: number]: LevelOfDetail;
}
export interface SceneModelState {
  [modelIdentifier: string]: ModelState;
}
