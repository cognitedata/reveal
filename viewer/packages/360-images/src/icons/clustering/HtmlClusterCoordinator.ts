/*!
 * Copyright 2026 Cognite AS
 */

import type { Overlay3DIcon } from '@reveal/3d-overlays';
import type { ClusterScreenInfo } from './ClusterRenderingStrategy';

export interface HtmlClusterCollection {
  getStagedHtmlClusterScreenInfos(): ClusterScreenInfo[];
  applyHtmlClusterOcclusion(occludedIcons: Set<Overlay3DIcon>): void;
}

/**
 * Coordinates HTML cluster occlusion detection across multiple Image360Collections.
 * Gathers per-frame screen-space data from all collections and computes a single
 * global occlusion set, then feeds it back to each collection for DOM updates.
 */
export class HtmlClusterCoordinator {
  // Screen-space overlap radius multiplier — matches HtmlClusterRenderer._occlusionFactor
  private readonly _occlusionFactor: number = 0.7;

  public runCoordinator(collections: HtmlClusterCollection[]): void {
    if (collections.length === 0) {
      return;
    }

    const allScreenInfos: ClusterScreenInfo[] = [];
    for (const collection of collections) {
      const infos = collection.getStagedHtmlClusterScreenInfos();
      for (const info of infos) {
        allScreenInfos.push(info);
      }
    }

    const occluded = this.computeGlobalOcclusion(allScreenInfos);

    for (const collection of collections) {
      collection.applyHtmlClusterOcclusion(occluded);
    }
  }

  private computeGlobalOcclusion(screenInfos: ClusterScreenInfo[]): Set<Overlay3DIcon> {
    const occluded = new Set<Overlay3DIcon>();
    const sorted = [...screenInfos].sort((a, b) => a.distance - b.distance);

    for (let i = 1; i < sorted.length; i++) {
      const far = sorted[i];
      for (let j = 0; j < i; j++) {
        const close = sorted[j];
        const screenDist = far.screenPos.distanceTo(close.screenPos);
        const overlapRadius = Math.max(far.projectedSize, close.projectedSize) * this._occlusionFactor;
        if (screenDist < overlapRadius) {
          occluded.add(far.data.icon);
          break;
        }
      }
    }

    return occluded;
  }
}
