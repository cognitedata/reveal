import { Overlay3DCollection } from '@cognite/reveal';
import { Observation } from './models';
import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { ThreeView } from '../../base/views/ThreeView';
import { ObservationsView } from './ObservationsView';
import { TranslateKey } from '../../base/utilities/TranslateKey';

export class ObservationsDomainObject extends VisualDomainObject {
  private _collection: Overlay3DCollection<Observation>;

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
