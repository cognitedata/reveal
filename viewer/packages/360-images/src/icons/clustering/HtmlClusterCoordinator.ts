/*!
 * Copyright 2026 Cognite AS
 */

import { BeforeSceneRenderedDelegate, EventTrigger } from '@reveal/utilities';
import { Overlay3DIcon } from '@reveal/3d-overlays';
import { ClusterScreenInfo } from './ClusterRenderingStrategy';

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
  private readonly _onBeforeSceneRenderedEvent: EventTrigger<BeforeSceneRenderedDelegate>;
  private readonly _collections: HtmlClusterCollection[] = [];
  private readonly _coordinatorHandler: BeforeSceneRenderedDelegate;
  // Screen-space overlap radius multiplier — matches HtmlClusterRenderer._occlusionFactor
  private readonly _occlusionFactor: number = 0.7;

  constructor(onBeforeSceneRendered: EventTrigger<BeforeSceneRenderedDelegate>) {
    this._onBeforeSceneRenderedEvent = onBeforeSceneRendered;
    this._coordinatorHandler = () => this._runCoordinator();
    this._onBeforeSceneRenderedEvent.subscribe(this._coordinatorHandler);
  }

  public onCollectionAdded(collection: HtmlClusterCollection): void {
    this._collections.push(collection);
    // Re-subscribe last so this handler always runs after all per-collection handlers
    this._onBeforeSceneRenderedEvent.unsubscribe(this._coordinatorHandler);
    this._onBeforeSceneRenderedEvent.subscribe(this._coordinatorHandler);
  }

  public onCollectionRemoved(collection: HtmlClusterCollection): void {
    const idx = this._collections.indexOf(collection);
    if (idx !== -1) {
      this._collections.splice(idx, 1);
    }
  }

  public dispose(): void {
    this._onBeforeSceneRenderedEvent.unsubscribe(this._coordinatorHandler);
    this._collections.length = 0;
  }

  private _runCoordinator(): void {
    if (this._collections.length === 0) {
      return;
    }

    const allScreenInfos: ClusterScreenInfo[] = [];
    for (const collection of this._collections) {
      const infos = collection.getStagedHtmlClusterScreenInfos();
      for (const info of infos) {
        allScreenInfos.push(info);
      }
    }

    const occluded = this._computeGlobalOcclusion(allScreenInfos);

    for (const collection of this._collections) {
      collection.applyHtmlClusterOcclusion(occluded);
    }
  }

  private _computeGlobalOcclusion(screenInfos: ClusterScreenInfo[]): Set<Overlay3DIcon> {
    const occluded = new Set<Overlay3DIcon>();
    const sorted = [...screenInfos].sort((a, b) => a.distance - b.distance);

    for (let i = 1; i < sorted.length; i++) {
      const far = sorted[i];
      for (let j = 0; j < i; j++) {
        const close = sorted[j];
        const dx = far.screenPos.x - close.screenPos.x;
        const dy = far.screenPos.y - close.screenPos.y;
        const screenDist = Math.sqrt(dx * dx + dy * dy);
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
