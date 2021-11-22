/*!
 * Copyright 2021 Cognite AS
 */

import { NodeCollectionBase, NodeAppearance } from '@reveal/core/src';
import { Cognite3DModel } from '@reveal/core';
import { MetricsLogger } from '@reveal/metrics';

/**
 * Timeline Key Frames contains parameters to access Nodes, Styles for the Timeline
 */
export class Keyframe {
  private readonly _date: Date;
  private readonly _model: Cognite3DModel;
  private readonly _nodeCollectionAndAppearance: { nodes: NodeCollectionBase; nodeAppearance: NodeAppearance }[] = [];

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
    this._nodeCollectionAndAppearance.forEach((node, _index) => {
      this._model.assignStyledNodeCollection(node.nodes, node.nodeAppearance);
    });
  }

  /**
   * Removes the style for the model
   */
  public deactivate() {
    this._nodeCollectionAndAppearance.forEach((node, _index) => {
      this._model.unassignStyledNodeCollection(node.nodes);
    });
  }

  /**
   * Add node & style to the collection
   * @param nodeCollection Node set to apply the Styles
   * @param nodeAppearance Style to assign to the node collection
   */
  public assignStyledNodeCollection(nodeCollection: NodeCollectionBase, nodeAppearance: NodeAppearance) {
    MetricsLogger.trackCadModelStyled(nodeCollection.classToken, nodeAppearance);

    const index = this._nodeCollectionAndAppearance.findIndex(x => x.nodes === nodeCollection);
    if (index !== -1) {
      throw new Error(
        'Node collection as already been assigned, use updateStyledNodeCollection() to update the appearance'
      );
    }

    this._nodeCollectionAndAppearance.push({ nodes: nodeCollection, nodeAppearance });
  }

  /**
   * Remove Node & Style for this keyframe's nodeCollection and nodeAppearance
   * @param nodeCollection Nodes to be unassign from node collection
   */
  public unassignStyledNodeCollection(nodeCollection: NodeCollectionBase) {
    const index = this._nodeCollectionAndAppearance.findIndex(x => x.nodes === nodeCollection);
    if (index === -1) {
      throw new Error('Node collection has not been assigned to model');
    }
    this._nodeCollectionAndAppearance.splice(index, 1);
  }
}
