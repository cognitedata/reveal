/*!
 * Copyright 2024 Cognite AS
 */
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { ObservationsDomainObject } from './ObservationsDomainObject';
import { BaseEditTool } from '../../base/commands/BaseEditTool';
import { type VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { IconName } from '../../../components/Architecture/getIconComponent';

export class ObservationsTool extends BaseEditTool {
  public override get icon(): IconName {
    return 'Location';
  }

  public override get tooltip(): TranslateKey {
    return { fallback: 'Show observations' };
  }

  public override onActivate(): void {
    let domainObject = this.getObservationsDomainObject();
    if (domainObject === undefined) {
      domainObject = new ObservationsDomainObject(this.renderTarget.fdmSdk);
      this.renderTarget.rootDomainObject.addChild(domainObject);
    }
    domainObject.setVisibleInteractive(true, this.renderTarget);
  }

  public override onDeactivate(): void {
    this.getObservationsDomainObject()?.setVisibleInteractive(false, this.renderTarget);
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);

    const domainObject = this.getIntersectedSelectableDomainObject(intersection);
    if (!(domainObject instanceof ObservationsDomainObject)) {
      await super.onClick(event);
      return;
    }

    const normalizedCoords = this.getNormalizedPixelCoordinates(event);

    const intersectedOverlay = domainObject.overlayCollection.intersectOverlays(
      normalizedCoords,
      this.renderTarget.camera
    );

    domainObject.setSelectedOverlay(intersectedOverlay);
  }

  protected override canBeSelected(domainObject: VisualDomainObject): boolean {
    return domainObject instanceof ObservationsDomainObject;
  }

  public getObservationsDomainObject(): ObservationsDomainObject | undefined {
    return this.rootDomainObject.getDescendantByType(ObservationsDomainObject);
  }
}
