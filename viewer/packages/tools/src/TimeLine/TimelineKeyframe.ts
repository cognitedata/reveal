/*!
 * Copyright 2021 Cognite AS
 */

import { NodeCollectionBase, NodeAppearance } from '@reveal/core/src';
import { Cognite3DModel } from '@reveal/core';

export class TimelineKeyframe {
  private readonly _date: number;
  private readonly _model: Cognite3DModel;
  private readonly _nodeCollection: NodeCollectionBase;
  private readonly _nodeAppearance: NodeAppearance;

  constructor(model: Cognite3DModel, date: number, nodeCollection: NodeCollectionBase, nodeAppearance?: NodeAppearance) {
    this._model = model;
    this._date = date;
    this._nodeCollection = nodeCollection;
    this._nodeAppearance = nodeAppearance!;
  }

  public getTimeFrameDate() {
    return this._date;
  }

  public applyStyle() {
    this._model.assignStyledNodeCollection(this._nodeCollection, this._nodeAppearance);
  }

  public removeStyle() {
    this._model.unassignStyledNodeCollection(this._nodeCollection);
  }
}