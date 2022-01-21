/*!
 * Copyright 2021 Cognite AS
 */

import { SceneModelState } from './rxSectorUtilities';
import { LevelOfDetail } from '@reveal/cad-parsers';

import assert from 'assert';

export class ModelStateHandler {
  private readonly _sceneModelState: SceneModelState;

  constructor() {
    this._sceneModelState = {} as SceneModelState;
  }

  hasStateChanged(modelIdentifier: string, sectorId: number, levelOfDetail: LevelOfDetail): boolean {
    const modelState = this._sceneModelState[modelIdentifier];
    assert(modelState !== undefined, `Model ${modelIdentifier} has not been added`);
    const sectorLevelOfDetail = modelState[sectorId];
    if (sectorLevelOfDetail !== undefined) {
      return sectorLevelOfDetail !== levelOfDetail;
    } else {
      return levelOfDetail !== LevelOfDetail.Discarded;
    }
  }

  addModel(modelIdentifier: string): void {
    assert(this._sceneModelState[modelIdentifier] === undefined, `Model ${modelIdentifier} is already added`);
    this._sceneModelState[modelIdentifier] = {};
  }

  removeModel(modelIdentifier: string): void {
    assert(this._sceneModelState[modelIdentifier] !== undefined, `Model ${modelIdentifier} is not added`);
    delete this._sceneModelState[modelIdentifier];
  }

  updateState(modelIdentifier: string, sectorId: number, levelOfDetail: LevelOfDetail): void {
    if (this._sceneModelState[modelIdentifier] === undefined) {
      // Received sector from model but the model is not added - happens when
      // sectors from newly removed model are loaded
      return;
    }

    const modelState = this._sceneModelState[modelIdentifier];
    if (levelOfDetail === LevelOfDetail.Discarded) {
      delete modelState[sectorId];
    } else {
      modelState[sectorId] = levelOfDetail;
    }
  }
}
