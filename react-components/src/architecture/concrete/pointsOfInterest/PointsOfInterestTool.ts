/*!
 * Copyright 2024 Cognite AS
 */
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { PointsOfInterestDomainObject } from './PointsOfInterestDomainObject';
import { isPointsOfInterestIntersection } from './types';
import { type IconName } from '../../base/utilities/IconName';
import { PointsOfInterestAdsProvider } from './ads/PointsOfInterestAdsProvider';
import { type Vector3 } from 'three';
import { type PointsOfInterestProvider } from './PointsOfInterestProvider';
import { type AnchoredDialogContent } from '../../base/commands/BaseTool';
import { AnchoredDialogUpdater } from '../../base/reactUpdaters/AnchoredDialogUpdater';
import { NavigationTool } from '../../base/concreteCommands/NavigationTool';
import { CreatePointsOfInterestWithDescriptionCommand } from './CreatePointsOfInterestWithDescriptionCommand';
import { InitiatePointsOfInterestCommand } from './InitiatePointsOfInterestCommand';

export class PointsOfInterestTool<PoIIdType> extends NavigationTool {
  private _isCreating: boolean = false;

  private _anchoredDialogContent: AnchoredDialogContent | undefined;

  public override get icon(): IconName {
    return 'Waypoint';
  }

  public override get tooltip(): TranslateKey {
    return { fallback: 'Create point of interest' };
  }

  public override onActivate(): void {
    super.onActivate();
    let domainObject = this.getPointsOfInterestDomainObject();
    if (domainObject === undefined) {
      domainObject = this.initializePointsOfInterestDomainObject();
    }
    domainObject.setVisibleInteractive(true, this.renderTarget);
    this.setIsCreating(true);
  }

  public override onDeactivate(): void {
    super.onDeactivate();
    const domainObject = this.getPointsOfInterestDomainObject();
    domainObject.setSelectedPointOfInterest(undefined);
    this.setIsCreating(false);
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    if (this._isCreating) {
      await this.initiateCreatPointOfInterest(event);
      this.setIsCreating(false);
      return;
    }
    await this.selectOverlayFromClick(event);
  }

  public override getAnchoredDialogContent(): AnchoredDialogContent | undefined {
    return this._anchoredDialogContent;
  }

  public getPointsOfInterestDomainObject(): PointsOfInterestDomainObject<PoIIdType> {
    const domainObject = this.rootDomainObject.getDescendantByType(PointsOfInterestDomainObject);
    if (domainObject !== undefined) {
      return domainObject;
    }
    return this.initializePointsOfInterestDomainObject();
  }

  private initializePointsOfInterestDomainObject(): PointsOfInterestDomainObject<PoIIdType> {
    const domainObject = new PointsOfInterestDomainObject(
      new PointsOfInterestAdsProvider(
        this.rootDomainObject.sdk
      ) as unknown as PointsOfInterestProvider<PoIIdType>
    );
    this.renderTarget.rootDomainObject.addChildInteractive(domainObject);
    return domainObject;
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

  private setAnchoredDialogContent(dialogContent: AnchoredDialogContent | undefined): void {
    this._anchoredDialogContent = dialogContent;
    AnchoredDialogUpdater.update();
  }

  public openCreateCommandDialog(position: Vector3): void {
    const createPointCommand = new CreatePointsOfInterestWithDescriptionCommand(position);
    createPointCommand.attach(this.renderTarget);

    const onFinishCallback = (): void => {
      this.closeCreateCommandDialog();
    };

    const onCancelCallback = (): void => {
      onFinishCallback();
    };

    createPointCommand.onFinish = onFinishCallback;
    createPointCommand.onCancel = onCancelCallback;

    this.setAnchoredDialogContent({
      contentCommands: [createPointCommand],
      position: position,
      onCloseCallback: onCancelCallback
    });
  }

  public closeCreateCommandDialog(): void {
    this.setAnchoredDialogContent(undefined);
    this.renderTarget.commandsController.activateDefaultTool();
  }

  private async selectOverlayFromClick(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);

    if (intersection === undefined || !isPointsOfInterestIntersection(intersection)) {
      await super.onClick(event);
      return;
    }

    intersection.domainObject.setSelectedPointOfInterest(intersection.userData);
  }

  private async initiateCreatPointOfInterest(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);
    if (!intersection || isPointsOfInterestIntersection(intersection)) {
      this.closeCreateCommandDialog();
      return;
    }
    this.openCreateCommandDialog(intersection.point);
  }
}
