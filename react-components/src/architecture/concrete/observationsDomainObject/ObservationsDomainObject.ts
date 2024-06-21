/*!
 * Copyright 2024 Cognite AS
 */
import { type Overlay3DCollection } from '@cognite/reveal';
import { type Observation } from './models';
import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type ThreeView } from '../../base/views/ThreeView';
import { ObservationsView } from './ObservationsView';
import { type TranslateKey } from '../../base/utilities/TranslateKey';

export class ObservationsDomainObject extends VisualDomainObject {
  private readonly _collection: Overlay3DCollection<Observation>;

  public override get typeName(): TranslateKey {
    return { fallback: ObservationsDomainObject.name };
  }

  constructor(collection: Overlay3DCollection<Observation>) {
    super();
    this._collection = collection;
  }

  public get overlayCollection(): Overlay3DCollection<Observation> {
    return this._collection;
  }

  protected override createThreeView(): ThreeView<ObservationsDomainObject> | undefined {
    return new ObservationsView(this._collection);
  }
}
