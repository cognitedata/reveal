/*!
 * Copyright 2020 Cognite AS
 */

import { SceneModelState } from './rxSectorUtilities';
import { WantedSector, ConsumedSector } from './types';
import { LevelOfDetail } from './LevelOfDetail';

export class ModelStateHandler {
  private readonly _sceneModelState: SceneModelState;

  constructor() {
    this._sceneModelState = {} as SceneModelState;
  }

  stateHasChanged(wantedSector: WantedSector): boolean {
    const modelState = this._sceneModelState[wantedSector.blobUrl];
    if (modelState != undefined) {
      const sectorLevelOfDetail = modelState[wantedSector.metadata.id];
      if (sectorLevelOfDetail != undefined) {
        return sectorLevelOfDetail !== wantedSector.levelOfDetail;
      } else {
        return wantedSector.levelOfDetail != LevelOfDetail.Discarded;
      }
    }
    return true;
  }

  updateState(consumedSector: ConsumedSector) {
    if (this._sceneModelState[consumedSector.blobUrl] == undefined) {
      this._sceneModelState[consumedSector.blobUrl] = {};
    }
    const modelState = this._sceneModelState[consumedSector.blobUrl];
    if (consumedSector.levelOfDetail === LevelOfDetail.Discarded) {
      delete modelState[consumedSector.metadata.id];
    } else {
      modelState[consumedSector.metadata.id] = consumedSector.levelOfDetail;
    }
  }
}
