/*!
 * Copyright 2021 Cognite AS
 */

import { NodeAppearance, NodeCollection } from '@reveal/cad-styling';
import { Cognite3DModel } from '@reveal/core';
import { MetricsLogger } from '@reveal/metrics';

/**
 * Timeline Key Frames contains parameters to access Nodes, Styles for the Timeline
 */
export class Keyframe {
  private readonly _date: Date;
  private readonly _model: Cognite3DModel;
  private readonly _nodeCollectionAndAppearance: { nodes: NodeCollection; nodeAppearance: NodeAppearance }[] = [];

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
  public activate(): void {
    this._nodeCollectionAndAppearance.forEach((node, _index) => {
      this._model.assignStyledNodeCollection(node.nodes, node.nodeAppearance);
    });
  }

  /**
   * Removes the style for the model
   */
  public deactivate(): void {
    this._nodeCollectionAndAppearance.forEach((node, _index) => {
      this._model.unassignStyledNodeCollection(node.nodes);
    });
  }

  /**
   * Add node & style to the collection. If the collection has been added, the style is updated to the
   * appearance provided.
   * @param nodeCollection Node set to apply the Styles
   * @param nodeAppearance Style to assign to the node collection
   */
  public assignStyledNodeCollection(nodeCollection: NodeCollection, nodeAppearance: NodeAppearance): void {
    MetricsLogger.trackCadModelStyled(nodeCollection.classToken, nodeAppearance);

    const index = this._nodeCollectionAndAppearance.findIndex(x => x.nodes === nodeCollection);
    if (index !== -1) {
      this._nodeCollectionAndAppearance[index].nodeAppearance = nodeAppearance;
    } else {
      this._nodeCollectionAndAppearance.push({ nodes: nodeCollection, nodeAppearance });
    }
  }

  /**
   * Remove Node & Style for this keyframe's nodeCollection and nodeAppearance
   * @param nodeCollection Nodes to be unassign from node collection
   */
  public unassignStyledNodeCollection(nodeCollection: NodeCollection): void {
    const index = this._nodeCollectionAndAppearance.findIndex(x => x.nodes === nodeCollection);
    if (index === -1) {
      throw new Error('Node collection has not been assigned to model');
    }
    this._nodeCollectionAndAppearance.splice(index, 1);
  }
}
