/*!
 * Copyright 2020 Cognite AS
 */

// @ts-ignore
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
    this.potreeGroup.name = 'PotreeGroup';
    this.name = 'Potree point cloud wrapper';
    this.add(this.potreeGroup);

    const onAfterRenderTrigger = new THREE.Mesh(new THREE.Geometry());
    onAfterRenderTrigger.onAfterRender = () => this.resetNeedsRedraw();
    this.add(onAfterRenderTrigger);
  }

  addPointCloud(node: PotreeNodeWrapper): void {
    this.potreeGroup.add(node.octtree);
    this.nodes.push(node);
  }

  *pointClouds(): Generator<PotreeNodeWrapper> {
    for (const child of this.potreeGroup.children) {
      yield new PotreeNodeWrapper(child as Potree.PointCloudOcttree);
    }
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
