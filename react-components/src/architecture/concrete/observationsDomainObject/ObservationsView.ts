/*!
 * Copyright 2024 Cognite AS
 */
import { Box3 } from 'three';
import { type ObservationsDomainObject } from './ObservationsDomainObject';
import { GroupThreeView } from '../../base/views/GroupThreeView';
import { type Overlay3DCollection } from '@cognite/reveal';
import { type Observation } from './models';

export class ObservationsView extends GroupThreeView<ObservationsDomainObject> {
  private readonly _collection: Overlay3DCollection<Observation>;

  constructor(collection: Overlay3DCollection<Observation>) {
    super();
    this._collection = collection;
  }

  protected override calculateBoundingBox(): Box3 {
    return this._collection
      .getOverlays()
      .reduce((box, overlay) => box.expandByPoint(overlay.getPosition()), new Box3());
  }

  protected override addChildren(): void {
    this.addChild(this._collection);
  }
}
