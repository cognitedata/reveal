/*!
 * Copyright 2021 Cognite AS
 */

import { NodeCollectionBase, NodeAppearance, DefaultNodeAppearance } from '@reveal/core/src';
import { Cognite3DModel } from '@reveal/core';

/**
 * Timeline Key Frames contains parameters to access Nodes, Styles for the Timeline
 */
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

  /**
   * Get date of the TimeLineFrame
   * @returns date
   */
  public getTimeLineFrameDate() {
    return this._date;
  }

  /**
   * Assigns the styles for the node set for the model for this TimeLineFrame
   */
  public applyStyle() {
    this._model.assignStyledNodeCollection(this._nodeCollection, this._nodeAppearance);
  }

  /**
   * Removes the style for the current node collection
   */
  public removeStyle() {
    this._model.unassignStyledNodeCollection(this._nodeCollection);
  }

  /**
   * Revert back to the default Style
   */
  public applyDefaultStyle() {
    this._model.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
  }
}