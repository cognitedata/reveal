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
import {
  createPointsOfInterestPropertiesFromPointAndTitle,
  isPointsOfInterestIntersection,
  type PointOfInterest
} from './types';
import { type IconName } from '../../base/utilities/IconName';
import { PointsOfInterestAdsProvider } from './ads/PointsOfInterestAdsProvider';
import { type Vector3 } from 'three';
import { type PointsOfInterestProvider } from './PointsOfInterestProvider';
import { type AnchoredDialogContent } from '../../base/commands/BaseTool';
import { AnchoredDialogUpdater } from '../../base/reactUpdaters/AnchoredDialogUpdater';
import { NavigationTool } from '../../base/concreteCommands/NavigationTool';

export class PointsOfInterestTool<PoIIdType> extends NavigationTool {
  private _isCreating: boolean = false;

  private readonly _createPointOfInterestCommand = new CreatePointsOfInterestCommand<PoIIdType>();
  private readonly _deletePointOfInterestCommand = new DeletePointsOfInterestCommand<PoIIdType>();
  private readonly _savePointOfInterestCommand = new SavePointsOfInterestCommand<PoIIdType>();

  private _anchoredDialogContent: AnchoredDialogContent | undefined;

  public override get icon(): IconName {
    return 'Waypoint';
  }

  public override get tooltip(): TranslateKey {
    return { fallback: 'Show and edit points of interest' };
  }

  public override getToolbar(): Array<BaseCommand | undefined> {
    return [
      this._createPointOfInterestCommand,
      this._deletePointOfInterestCommand,
      this._savePointOfInterestCommand
    ];
  }

  public get createPointOfInterestCommand(): CreatePointsOfInterestCommand<PoIIdType> {
    return this._createPointOfInterestCommand;
  }

  public get deletePointsOfInterestInstances(): DeletePointsOfInterestCommand<PoIIdType> {
    return this._deletePointOfInterestCommand;
  }

  public get savePointsOfInterestInstances(): SavePointsOfInterestCommand<PoIIdType> {
    return this._savePointOfInterestCommand;
  }

  public override onActivate(): void {
    super.onActivate();
    let domainObject = this.getPointsOfInterestDomainObject();
    if (domainObject === undefined) {
      domainObject = this.initializePointsOfInterestDomainObject();
    }
    domainObject.setVisibleInteractive(true, this.renderTarget);
  }

  public override onDeactivate(): void {
    super.onDeactivate();
    const domainObject = this.getPointsOfInterestDomainObject();
    domainObject.setSelectedPointOfInterest(undefined);
    domainObject.setVisibleInteractive(false, this.renderTarget);
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    if (this._isCreating) {
      await this.createPendingPointsOfInterest(event);
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

  public setAnchoredDialogContent(dialogContent: AnchoredDialogContent | undefined): void {
    this._anchoredDialogContent = dialogContent;
    AnchoredDialogUpdater.update();
  }

  private async selectOverlayFromClick(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);

    if (intersection === undefined || !isPointsOfInterestIntersection(intersection)) {
      await super.onClick(event);
      return;
    }

    intersection.domainObject.setSelectedPointOfInterest(intersection.userData);
  }

  private async createPendingPointsOfInterest(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);

    if (intersection === undefined) {
      await super.onClick(event);
      return;
    }

    const pendingOverlay = this.createPendingPointOfInterestAtPosition(intersection.point);

    const domainObject = this.getPointsOfInterestDomainObject();
    domainObject.setSelectedPointOfInterest(pendingOverlay);

    this.setIsCreating(false);
  }

  private createPendingPointOfInterestAtPosition(
    position: Vector3,
    title?: string
  ): PointOfInterest<PoIIdType> | undefined {
    const domainObject = this.getPointsOfInterestDomainObject();
    const pendingOverlay = domainObject.addPendingPointsOfInterest(
      createPointsOfInterestPropertiesFromPointAndTitle(position, title)
    );

    return pendingOverlay;
  }
}
