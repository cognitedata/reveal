/*!
 * Copyright 2024 Cognite AS
 */
import { type IconType } from '@cognite/cogs.js';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { type Observation } from './models';
import { ObservationsDomainObject } from './ObservationsDomainObject';
import { type Overlay3D } from '@cognite/reveal';
import { DEFAULT_OVERLAY_COLOR, SELECTED_OVERLAY_COLOR } from './constants';
import { BaseEditTool } from '../../base/commands/BaseEditTool';
import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';

export class ObservationsTool extends BaseEditTool {
  private _selectedOverlay: Overlay3D<Observation> | undefined;
  private _observationsDomainObject: ObservationsDomainObject | undefined;

  constructor() {
    super();
  }

  public override get icon(): IconType {
    return 'Location';
  }

  public override get tooltip(): TranslateKey {
    return { fallback: 'Show observations' };
  }

  public override onActivate(): void {
    if (this._observationsDomainObject === undefined) {
      this._observationsDomainObject = new ObservationsDomainObject(this.renderTarget.fdmSdk);
      this.renderTarget.rootDomainObject.addChild(this._observationsDomainObject);
    }
    this._observationsDomainObject.setVisibleInteractive(true, this.renderTarget);
  }

  public override onDeactivate(): void {
    this._observationsDomainObject?.setVisibleInteractive(false, this.renderTarget);
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      await super.onClick(event);
      return;
    }

    const domainObject = this.getIntersectedSelectableDomainObject(intersection);
    if (!(domainObject instanceof ObservationsDomainObject)) {
      return;
    }

    const normalizedCoords = this.getNormalizedPixelCoordinates(event);

    const intersectedIcon = domainObject.overlayCollection.intersectOverlays(
      normalizedCoords,
      this.renderTarget.camera
    );

    this.handleIntersectedOverlay(intersectedIcon);

    this.renderTarget.viewer.requestRedraw();
  }

  private handleIntersectedOverlay(overlay: Overlay3D<Observation> | undefined): void {
    this._selectedOverlay?.setColor(DEFAULT_OVERLAY_COLOR);
    this._selectedOverlay = undefined;

    if (overlay === undefined) {
      return;
    }
    overlay.setColor(SELECTED_OVERLAY_COLOR);
    this.renderTarget.viewer.requestRedraw();
    this._selectedOverlay = overlay;
  }

  protected override canBeSelected(domainObject: VisualDomainObject): boolean {
    return domainObject instanceof ObservationsDomainObject;
  }
}
