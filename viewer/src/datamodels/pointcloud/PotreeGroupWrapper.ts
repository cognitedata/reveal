/*!
 * Copyright 2021 Cognite AS
 */

import * as Potree from '@cognite/potree-core';
import * as THREE from 'three';

import { PotreeNodeWrapper } from './PotreeNodeWrapper';

/**
 * Wrapper around Potree.Group with type information and
 * basic functionality.
 */
export class PotreeGroupWrapper extends THREE.Object3D {
  private _needsRedraw: boolean = true;

  get needsRedraw(): boolean {
    return (
      this._needsRedraw ||
      Potree.Global.numNodesLoading !== this.numNodesLoadingAfterLastRedraw ||
      this.numChildrenAfterLastRedraw !== this.potreeGroup.children.length ||
      this.nodes.some(n => n.needsRedraw)
    );
  }

  private readonly nodes: PotreeNodeWrapper[] = [];
  private readonly potreeGroup: Potree.Group;
  private numNodesLoadingAfterLastRedraw = 0;
  private numChildrenAfterLastRedraw = 0;

  constructor() {
    super();
    this.potreeGroup = new Potree.Group();
    this.potreeGroup.name = 'Potree.Group';
    this.name = 'Potree point cloud wrapper';
    this.add(this.potreeGroup);

    const onAfterRenderTrigger = new THREE.Mesh(new THREE.Geometry());
    onAfterRenderTrigger.name = 'onAfterRender trigger (no geometry)';
    onAfterRenderTrigger.onAfterRender = () => this.resetNeedsRedraw();
    this.add(onAfterRenderTrigger);
  }

  addPointCloud(node: PotreeNodeWrapper): void {
    this.potreeGroup.add(node.octtree);
    this.nodes.push(node);
  }

  removePointCloud(node: PotreeNodeWrapper): void {
    const index = this.nodes.indexOf(node);
    if (index === -1) {
      throw new Error('Point cloud is not added - cannot remove it');
    }
    this.potreeGroup.remove(node.octtree);
    this.nodes.splice(index, 1);
  }

  requestRedraw() {
    this._needsRedraw = true;
  }

  private resetNeedsRedraw() {
    this.numNodesLoadingAfterLastRedraw = Potree.Global.numNodesLoading;
    this.numChildrenAfterLastRedraw = this.potreeGroup.children.length;
    this.nodes.forEach(n => n.resetNeedsRedraw());
  }
}
