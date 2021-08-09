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
    const modelState = this._sceneModelState[wantedSector.modelIdentifier];
    assert(modelState !== undefined, `Model ${wantedSector.modelIdentifier} has not been added`);
    const sectorLevelOfDetail = modelState[wantedSector.metadata.id];
    if (sectorLevelOfDetail !== undefined) {
      return sectorLevelOfDetail !== wantedSector.levelOfDetail;
    } else {
      return wantedSector.levelOfDetail !== LevelOfDetail.Discarded;
    }
  }

  addModel(modelIdentifier: string) {
    assert(this._sceneModelState[modelIdentifier] === undefined, `Model ${modelIdentifier} is already added`);
    this._sceneModelState[modelIdentifier] = {};
  }

  removeModel(modelIdentifier: string) {
    assert(this._sceneModelState[modelIdentifier] !== undefined, `Model ${modelIdentifier} is not added`);
    delete this._sceneModelState[modelIdentifier];
  }

  updateState(consumedSector: ConsumedSector) {
    if (this._sceneModelState[consumedSector.modelIdentifier] === undefined) {
      // Received sector from model but the model is not added - happens when
      // sectors from newly removed model are loaded
      return;
    }

    const modelState = this._sceneModelState[consumedSector.modelIdentifier];
    if (consumedSector.levelOfDetail === LevelOfDetail.Discarded) {
      delete modelState[consumedSector.metadata.id];
    } else {
      modelState[consumedSector.metadata.id] = consumedSector.levelOfDetail;
    }
  }
}
