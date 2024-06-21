/*!
 * Copyright 2024 Cognite AS
 */
import { type IconType } from '@cognite/cogs.js';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { type FdmSDK, type InstanceFilter } from '../../../utilities/FdmSDK';
import { OBSERVATION_SOURCE, type Observation, type ObservationProperties } from './models';
import { ObservationsDomainObject } from './ObservationsDomainObject';
import { Color, Vector3 } from 'three';
import { CDF_TO_VIEWER_TRANSFORMATION, type Overlay3D, Overlay3DCollection } from '@cognite/reveal';
import { NavigationTool } from '../../base/concreteCommands/NavigationTool';
import { type RevealRenderTarget } from '../../base/renderTarget/RevealRenderTarget';

const DEFAULT_OVERLAY_COLOR = new Color('lightblue');
const SELECTED_OVERLAY_COLOR = new Color('red');

export class ObservationsTool extends NavigationTool {
  // private _domainObjects: ObservationsDomainObject[] = [];
  private readonly _domainObjectPromise: Promise<ObservationsDomainObject>;

  private _selectedOverlay: Overlay3D<Observation> | undefined;

  constructor(fdmSdk: FdmSDK) {
    super();
    this._domainObjectPromise = fetchObservations(fdmSdk).then(
      async (observations) => await this.initializeDomainObjects(observations)
    );
  }

  private async initializeDomainObjects(
    observations: Observation[]
  ): Promise<ObservationsDomainObject> {
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

    const collection = new Overlay3DCollection<Observation>(observationOverlays, {
      defaultOverlayColor: DEFAULT_OVERLAY_COLOR
    });

    const observationDomainObject = new ObservationsDomainObject(collection);

    return observationDomainObject;
  }

  public override get icon(): IconType {
    return 'Location';
  }

  public override get tooltip(): TranslateKey {
    return { fallback: 'Show observations' };
  }

  public override attach(renderTarget: RevealRenderTarget): void {
    super.attach(renderTarget);
    void this._domainObjectPromise.then((domainObject) => {
      renderTarget.rootDomainObject.addChildInteractive(domainObject);
    });
  }

  public override onActivate(): void {
    void this._domainObjectPromise.then((domainObject) =>
      domainObject.setVisibleInteractive(true, this.renderTarget)
    );
  }

  public override onDeactivate(): void {
    void this._domainObjectPromise.then((domainObject) => {
      domainObject.setVisibleInteractive(false, this.renderTarget);
    });
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const domainObject = await this._domainObjectPromise;
    this._selectedOverlay?.setColor(DEFAULT_OVERLAY_COLOR);

    const normalizedCoord = this.getNormalizedPixelCoordinates(event);
    const intersection = domainObject.overlayCollection.intersectOverlays(
      normalizedCoord,
      this.renderTarget.camera
    );

    if (intersection !== undefined) {
      this.handleIntersectedOverlay(intersection);
    } else {
      this._selectedOverlay = undefined;
    }

    this.renderTarget.viewer.requestRedraw();
  }

  private handleIntersectedOverlay(overlay: Overlay3D<Observation>): void {
    overlay.setColor(SELECTED_OVERLAY_COLOR);
    this.renderTarget.viewer.requestRedraw();
    this._selectedOverlay = overlay;
  }
}

const observationsFilter: InstanceFilter = {};

async function fetchObservations(fdmSdk: FdmSDK): Promise<Observation[]> {
  const observationResult = await fdmSdk.filterAllInstances<ObservationProperties>(
    observationsFilter,
    'node',
    OBSERVATION_SOURCE
  );

  return observationResult.instances;
}
