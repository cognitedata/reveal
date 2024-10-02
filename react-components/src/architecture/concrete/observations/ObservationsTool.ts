/*!
 * Copyright 2024 Cognite AS
 */
import { type IconType } from '@cognite/cogs.js';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { ObservationsDomainObject } from './ObservationsDomainObject';
import { BaseEditTool } from '../../base/commands/BaseEditTool';
import { type VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type BaseCommand } from '../../base/commands/BaseCommand';
import { CreateObservationCommand } from './CreateObservationCommand';
import { SaveObservationsCommand } from './SaveObservationsCommand';
import { DeleteObservationCommand } from './DeleteObservationCommand';
import { createEmptyObservationProperties, isObservationIntersection } from './types';

export class ObservationsTool extends BaseEditTool {
  private _isCreating: boolean = false;

  protected override canBeSelected(domainObject: VisualDomainObject): boolean {
    return domainObject instanceof ObservationsDomainObject;
  }

  public override get icon(): IconType {
    return 'Location';
  }

  public override get tooltip(): TranslateKey {
    return { fallback: 'Show and edit observations' };
  }

  public override getToolbar(): Array<BaseCommand | undefined> {
    return [
      new CreateObservationCommand(),
      new DeleteObservationCommand(),
      new SaveObservationsCommand()
    ];
  }

  public override onActivate(): void {
    super.onActivate();
    let domainObject = this.getObservationsDomainObject();
    if (domainObject === undefined) {
      domainObject = new ObservationsDomainObject(this.rootDomainObject.fdmSdk);
      this.renderTarget.rootDomainObject.addChildInteractive(domainObject);
    }
    domainObject.setVisibleInteractive(true, this.renderTarget);
  }

  public override onDeactivate(): void {
    super.onDeactivate();
    const domainObject = this.getObservationsDomainObject();
    domainObject?.setSelectedObservation(undefined);
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    if (this._isCreating) {
      await this.createPendingObservation(event);
      return;
    }
    await this.selectOverlayFromClick(event);
  }

  public getObservationsDomainObject(): ObservationsDomainObject | undefined {
    return this.rootDomainObject.getDescendantByType(ObservationsDomainObject);
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

    if (intersection === undefined || !isObservationIntersection(intersection)) {
      await super.onClick(event);
      return;
    }

    intersection.domainObject.setSelectedObservation(intersection.userData);
  }

  private async createPendingObservation(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);

    if (intersection === undefined) {
      await super.onClick(event);
      return;
    }
    const domainObject = this.getObservationsDomainObject();
    const pendingOverlay = domainObject?.addPendingObservation(
      createEmptyObservationProperties(intersection.point)
    );
    domainObject?.setSelectedObservation(pendingOverlay);

    this.setIsCreating(false);
  }
}
