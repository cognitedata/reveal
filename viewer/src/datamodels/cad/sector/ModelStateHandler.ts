/*!
 * Copyright 2021 Cognite AS
 */

import { SceneModelState } from './rxSectorUtilities';
import { WantedSector, ConsumedSector } from './types';
import { LevelOfDetail } from './LevelOfDetail';
import assert from 'assert';

export class ModelStateHandler {
  private readonly _sceneModelState: SceneModelState;

  constructor() {
    this._sceneModelState = {} as SceneModelState;
  }

  hasStateChanged(wantedSector: WantedSector): boolean {
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

  addModel(modelBlobUrl: string) {
    assert(this._sceneModelState[modelBlobUrl] === undefined, `Model ${modelBlobUrl} is already added`);
    this._sceneModelState[modelBlobUrl] = {};
  }

  removeModel(modelBlobUrl: string) {
    assert(this._sceneModelState[modelBlobUrl] !== undefined, `Model ${modelBlobUrl} is not added`);
    delete this._sceneModelState[modelBlobUrl];
  }

  updateState(consumedSector: ConsumedSector) {
    assert(
      this._sceneModelState[consumedSector.blobUrl] !== undefined,
      `Received sector from model ${consumedSector.blobUrl}, but the model is not added`
    );
    const modelState = this._sceneModelState[consumedSector.blobUrl];
    if (consumedSector.levelOfDetail === LevelOfDetail.Discarded) {
      delete modelState[consumedSector.metadata.id];
    } else {
      modelState[consumedSector.metadata.id] = consumedSector.levelOfDetail;
    }
  }
}
