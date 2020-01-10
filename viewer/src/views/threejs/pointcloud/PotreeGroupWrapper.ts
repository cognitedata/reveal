/*!
 * Copyright 2019 Cognite AS
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
  get needsRedraw(): boolean {
    return (
      Potree.Global.numNodesLoading !== this.numNodesLoadingAfterLastRedraw ||
      this.numChildrenAfterLastRedraw !== this.potreeGroup.children.length
    );
  }

  private readonly potreeGroup: Potree.Group;
  private numNodesLoadingAfterLastRedraw = 0;
  private numChildrenAfterLastRedraw = 0;

  constructor() {
    super();
    this.potreeGroup = new Potree.Group();
    this.potreeGroup.name = 'PotreeGroup';
    this.name = 'Potree point cloud wrapper';
    this.add(this.potreeGroup);

    this.onAfterRender = this.resetNeedsRedraw;
  }

  addPointCloud(node: PotreeNodeWrapper): void {
    this.potreeGroup.add(node.octtree);
  }

  *pointClouds(): Generator<PotreeNodeWrapper> {
    for (const child of this.potreeGroup.children) {
      yield new PotreeNodeWrapper(child as Potree.PointCloudOcttree);
    }
  }

  private resetNeedsRedraw() {
    this.numNodesLoadingAfterLastRedraw = Potree.Global.numNodesLoading;
    this.numChildrenAfterLastRedraw = this.potreeGroup.children.length;
  }
}
