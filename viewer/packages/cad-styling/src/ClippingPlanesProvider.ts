/*!
 * Copyright 2026 Cognite AS
 */

import { EventTrigger } from '@reveal/utilities';
import type { Plane } from 'three';

export class ClippingPlanesProvider {
  private _clippingPlanes: Plane[];
  private readonly _changed: EventTrigger<(clippingPlanes: Plane[]) => void>;

  constructor() {
    this._clippingPlanes = [];
    this._changed = new EventTrigger<(clippingPlanes: Plane[]) => void>();
  }

  get clippingPlanes(): Plane[] {
    return this._clippingPlanes;
  }

  set clippingPlanes(clippingPlanes: Plane[]) {
    this._clippingPlanes = clippingPlanes;
    this._changed.fire(this._clippingPlanes);
  }

  on(_: 'changed', listener: (clippingPlanes: Plane[]) => void): void {
    this._changed.subscribe(listener);
  }

  off(_: 'changed', listener: (clippingPlanes: Plane[]) => void): void {
    this._changed.unsubscribe(listener);
  }

  dispose(): void {
    this._changed.unsubscribeAll();
  }
}
