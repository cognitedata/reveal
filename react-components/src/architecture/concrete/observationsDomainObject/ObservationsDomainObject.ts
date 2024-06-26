/*!
 * Copyright 2024 Cognite AS
 */
import { CDF_TO_VIEWER_TRANSFORMATION, type Overlay3D, Overlay3DCollection } from '@cognite/reveal';
import { OBSERVATION_SOURCE, type ObservationProperties, type Observation } from './models';
import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type ThreeView } from '../../base/views/ThreeView';
import { ObservationsView } from './ObservationsView';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { type FdmSDK, type InstanceFilter } from '../../../utilities/FdmSDK';
import { Vector3 } from 'three';
import { DEFAULT_OVERLAY_COLOR } from './constants';
import { Changes } from '../../base/domainObjectsHelpers/Changes';

export class ObservationsDomainObject extends VisualDomainObject {
  private _selectedOverlay: Overlay3D<Observation> | undefined;

  private readonly _collection = new Overlay3DCollection<Observation>([], {
    defaultOverlayColor: DEFAULT_OVERLAY_COLOR
  });

  constructor(fdmSdk: FdmSDK) {
    super();
    void fetchObservations(fdmSdk).then((observations) => {
      this.initializeCollection(observations);
      this.notify(Changes.geometry);
    });
  }

  public override get typeName(): TranslateKey {
    return { fallback: ObservationsDomainObject.name };
  }

  protected override createThreeView(): ThreeView<ObservationsDomainObject> | undefined {
    return new ObservationsView();
  }

  private initializeCollection(observations: Observation[]): void {
    const observationOverlays = observations.map((observation) => {
      const position = new Vector3(
        observation.properties.positionX,
        observation.properties.positionY,
        observation.properties.positionZ
      ).applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

      return {
        position,
        content: observation
      };
    });

    this._collection.addOverlays(observationOverlays);
  }

  public get overlayCollection(): Overlay3DCollection<Observation> {
    return this._collection;
  }

  public getSelectedOverlay(): Overlay3D<Observation> | undefined {
    return this._selectedOverlay;
  }

  public setSelectedOverlay(overlay: Overlay3D<Observation> | undefined): void {
    this._selectedOverlay = overlay;
    this.notify(Changes.selected);
  }
}

async function fetchObservations(fdmSdk: FdmSDK): Promise<Observation[]> {
  const observationsFilter: InstanceFilter = {};

  const observationResult = await fdmSdk.filterAllInstances<ObservationProperties>(
    observationsFilter,
    'node',
    OBSERVATION_SOURCE
  );

  return observationResult.instances;
}
