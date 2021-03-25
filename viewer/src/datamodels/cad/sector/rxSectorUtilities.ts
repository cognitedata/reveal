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
  collectStatisticsCallback: (spendage: SectorLoadingSpendage) => void
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

      return from(prioritizedResult.wantedSectors).pipe(
        subscribeOn(asyncScheduler),
        filter(modelStateHandler.hasStateChanged.bind(modelStateHandler)),
        bufferCount(5),
        mergeMap(batch => {
          const filteredSectorsPromise = sectorCuller.filterSectorsToLoad(input, batch);
          return from(filteredSectorsPromise).pipe(
            mergeMap(x => x),
            mergeMap(x => sectorRepository.loadSector(x))
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
  [blobUrl: string]: ModelState;
}
