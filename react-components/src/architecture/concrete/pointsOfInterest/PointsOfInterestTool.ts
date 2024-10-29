/*!
 * Copyright 2024 Cognite AS
 */
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { PointsOfInterestDomainObject } from './PointsOfInterestDomainObject';
import { BaseEditTool } from '../../base/commands/BaseEditTool';
import { type VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type BaseCommand } from '../../base/commands/BaseCommand';
import { CreatePointsOfInterestCommand } from './CreatePointsOfInterestCommand';
import { SavePointsOfInterestCommand } from './SavePointsOfInterestCommand';
import { DeletePointsOfInterestCommand } from './DeletePointsOfInterestCommand';
import { createEmptyPointsOfInterestProperties, isPointsOfInterestIntersection } from './types';
import { type IconName } from '../../base/utilities/IconName';
import { PointsOfInterestAdsProvider } from './ads/PointsOfInterestAdsProvider';
import { type ExternalId } from '../../../data-providers/FdmSDK';

export class PointsOfInterestTool<PoIIdType> extends BaseEditTool {
  private _isCreating: boolean = false;

  protected override canBeSelected(domainObject: VisualDomainObject): boolean {
    return domainObject instanceof PointsOfInterestDomainObject;
  }

  public override get icon(): IconName {
    return 'Location';
  }

  public override get tooltip(): TranslateKey {
    return { fallback: 'Show and edit points of interest' };
  }

  public override getToolbar(): Array<BaseCommand | undefined> {
    return [
      new CreatePointsOfInterestCommand<PoIIdType>(),
      new DeletePointsOfInterestCommand<PoIIdType>(),
      new SavePointsOfInterestCommand<PoIIdType>()
    ];
  }

  public override onActivate(): void {
    super.onActivate();
    let domainObject = this.getPointsOfInterestDomainObject();
    if (domainObject === undefined) {
      domainObject = new PointsOfInterestDomainObject(
        new PointsOfInterestAdsProvider(this.rootDomainObject.sdk)
      );
      this.renderTarget.rootDomainObject.addChildInteractive(domainObject);
    }
    domainObject.setVisibleInteractive(true, this.renderTarget);
  }

  public override onDeactivate(): void {
    super.onDeactivate();
    const domainObject = this.getPointsOfInterestDomainObject();
    domainObject?.setSelectedPointsOfInterest(undefined);
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    if (this._isCreating) {
      await this.createPendingPointsOfInterest(event);
      return;
    }
    await this.selectOverlayFromClick(event);
  }

  public getPointsOfInterestDomainObject(): PointsOfInterestDomainObject<ExternalId> | undefined {
    return this.rootDomainObject.getDescendantByType(PointsOfInterestDomainObject);
  }

  public get isCreating(): boolean {
    return this._isCreating;
  }

  public setIsCreating(value: boolean): void {
    this._isCreating = value;
    if (value) {
      this.renderTarget.setCrosshairCursor();
    } else {
      this.renderTarget.setNavigateCursor();
    }
  }

  private async selectOverlayFromClick(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);

    if (intersection === undefined || !isPointsOfInterestIntersection(intersection)) {
      await super.onClick(event);
      return;
    }

    intersection.domainObject.setSelectedPointsOfInterest(intersection.userData);
  }

  private async createPendingPointsOfInterest(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);

    if (intersection === undefined) {
      await super.onClick(event);
      return;
    }
    const domainObject = this.getPointsOfInterestDomainObject();
    const pendingOverlay = domainObject?.addPendingPointsOfInterest(
      createEmptyPointsOfInterestProperties(intersection.point)
    );
    domainObject?.setSelectedPointsOfInterest(pendingOverlay);

    this.setIsCreating(false);
  }
}
