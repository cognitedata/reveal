/*!
 * Copyright 2021 Cognite AS
 */

import { DetermineSectorsInput } from './culling/types';
import { LevelOfDetail } from './LevelOfDetail';
import { SectorCuller } from './culling/SectorCuller';
import { OperatorFunction, empty, from, Observable, asyncScheduler } from 'rxjs';
import { ConsumedSector } from './types';
import { ModelStateHandler } from './ModelStateHandler';
import { Repository } from './Repository';
import { filter, switchMap, tap, publish, subscribeOn } from 'rxjs/operators';

export function handleDetermineSectorsInput(
  sectorRepository: Repository,
  sectorCuller: SectorCuller
): OperatorFunction<DetermineSectorsInput, ConsumedSector> {
  return publish((source$: Observable<DetermineSectorsInput>) => {
    const modelStateHandler = new ModelStateHandler();
    const updateSector = (input: DetermineSectorsInput) => {
      const { cameraInMotion } = input;
      if (cameraInMotion) {
        return empty();
      }
      return from(sectorCuller.determineSectors(input)).pipe(
        subscribeOn(asyncScheduler),
        filter(modelStateHandler.hasStateChanged.bind(modelStateHandler)),
        sectorRepository.loadSector()
      );
    };

    return source$.pipe(switchMap(updateSector)).pipe(
      tap({
        next: modelStateHandler.updateState.bind(modelStateHandler)
      })
    );
  });
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
