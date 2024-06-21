import { IconType } from '@cognite/cogs.js';
import { TranslateKey } from '../../base/utilities/TranslateKey';
import { FdmSDK, InstanceFilter } from '../../../utilities/FdmSDK';
import { OBSERVATION_SOURCE, Observation, ObservationProperties } from './models';
import { ObservationsDomainObject } from './ObservationsDomainObject';
import { Color, Vector2, Vector3 } from 'three';
import { CDF_TO_VIEWER_TRANSFORMATION, Overlay3D, Overlay3DCollection } from '@cognite/reveal';
import { NavigationTool } from '../../base/concreteCommands/NavigationTool';
import { RevealRenderTarget } from '../../base/renderTarget/RevealRenderTarget';

const DEFAULT_OVERLAY_COLOR = new Color('lightblue');
const SELECTED_OVERLAY_COLOR = new Color('red');

export class ObservationsTool extends NavigationTool {
  // private _domainObjects: ObservationsDomainObject[] = [];
  private _domainObjectPromise: Promise<ObservationsDomainObject>;

  private _selectedOverlay: Overlay3D<Observation> | undefined;

  constructor(fdmSdk: FdmSDK) {
    super();
    this._domainObjectPromise = fetchObservations(fdmSdk).then((observations) =>
      this.initializeDomainObjects(observations)
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

    console.log('Observation overlays: ', observationOverlays);

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

  public override attach(renderTarget: RevealRenderTarget) {
    super.attach(renderTarget);
    this._domainObjectPromise.then((domainObject) =>
      renderTarget.rootDomainObject.addChildInteractive(domainObject)
    );
  }

  public override onActivate() {
    this._domainObjectPromise.then((domainObject) =>
      domainObject.setVisibleInteractive(true, this.renderTarget)
    );
  }

  public override onDeactivate() {
    this._domainObjectPromise.then((domainObject) => {
      domainObject.setVisibleInteractive(false, this.renderTarget);
    });
  }

  public override async onClick(event: PointerEvent) {
    const domainObject = await this._domainObjectPromise;
    domainObject.overlayCollection
      .getOverlays()
      .forEach((overlay) => overlay.setColor(DEFAULT_OVERLAY_COLOR));

    const normalizedCoord = this.getNormalizedPixelCoordinates(event);
    const intersection = domainObject.overlayCollection.intersectOverlays(
      normalizedCoord,
      this.renderTarget.camera
    );

    if (intersection !== undefined) {
      this.handleIntersectedOverlay(intersection);
    }
  }

  private handleIntersectedOverlay(overlay: Overlay3D<Observation>) {
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
