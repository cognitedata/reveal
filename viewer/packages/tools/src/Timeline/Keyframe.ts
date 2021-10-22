/*!
 * Copyright 2021 Cognite AS
 */

import { NodeCollectionBase, NodeAppearance } from '@reveal/core/src';
import { Cognite3DModel } from '@reveal/core';

/**
 * Timeline Key Frames contains parameters to access Nodes, Styles for the Timeline
 */
export class Keyframe {
  private readonly _date: Date;
  private readonly _model: Cognite3DModel;
  private _nodeCollection: NodeCollectionBase[] = new Array<NodeCollectionBase>();
  private _nodeAppearance: NodeAppearance[] = new Array<NodeAppearance>();

  constructor(model: Cognite3DModel, date: Date) {
    this._model = model;
    this._date = date;
  }

  /**
   * Get date of the Keyframe
   * @returns date
   */
  public getKeyframeDate(): Date {
    return this._date;
  }

  /**
   * Assigns the styles for the node set for the model for this Keyframe
   */
  public activate() {
    this._nodeCollection.forEach((nodeCollection, index) => {
      this._model.assignStyledNodeCollection(nodeCollection, this._nodeAppearance[index]);
    });
  }

  /**
   * Removes the style for the model
   */
  public deactivate() {
    for (const nodeCollection of this._nodeCollection) {
      this._model.unassignStyledNodeCollection(nodeCollection);
    }
  }

  /**
   * Add node & style to the collection
   * @param nodeCollection Node set to apply the Styles
   * @param nodeAppearance Style to assign to the node collection
   */
  public assignStyledNodeCollection(nodeCollection: NodeCollectionBase, nodeAppearance: NodeAppearance) {
    if (nodeCollection && nodeAppearance) {
      this._nodeCollection.push(nodeCollection);
      this._nodeAppearance.push(nodeAppearance);
    }
  }

  /**
   * Remove Node & Style for this keyframe's nodeCollection and nodeAppearance
   * @param nodeCollection Nodes to be unassign from node collection
   * @param nodeAppearance Style to be unassign from node appearance
   */
  public unassignStyledNodeCollection(nodeCollection: NodeCollectionBase, nodeAppearance: NodeAppearance) {
    if (this._nodeCollection.length > 0) {
      const index = this._nodeCollection.findIndex(obj => obj === nodeCollection);

      if (index > -1) {
        this._nodeCollection = this._nodeCollection.splice(index, 1);
      }
    }

    if (this._nodeAppearance.length > 0) {
      const index = this._nodeAppearance.findIndex(obj => obj === nodeAppearance);

      if (index > -1) {
        this._nodeAppearance = this._nodeAppearance.splice(index, 1);
      }
    }
  }
}
