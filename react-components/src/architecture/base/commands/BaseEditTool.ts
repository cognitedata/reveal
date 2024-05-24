/*!
 * Copyright 2024 Cognite AS
 */

import { NavigationTool } from './NavigationTool';
import { type DomainObject } from '../domainObjects/DomainObject';
import { isDomainObjectIntersection } from '../domainObjectsHelpers/DomainObjectIntersection';
import { type BaseDragger } from '../domainObjectsHelpers/BaseDragger';

export abstract class BaseEditTool extends NavigationTool {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _dragger: BaseDragger | undefined = undefined;

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override get defaultCursor(): string {
    return 'crosshair';
  }

  public override clearDragging(): void {
    super.clearDragging();
    this._dragger = undefined;
  }

  public override async onPointerDown(event: PointerEvent, leftButton: boolean): Promise<void> {
    this._dragger = await this.createDragger(event);
    if (this._dragger === undefined) {
      await super.onPointerDown(event, leftButton);
      return;
    }
    this._dragger.onPointerDown(event);
    this.deselectAll(this._dragger.domainObject);
    this._dragger.domainObject.setSelectedInteractive(true);
  }

  public override async onPointerDrag(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (this._dragger === undefined) {
      await super.onPointerDrag(event, leftButton);
      return;
    }
    const ray = this.getRay(event, true);
    this._dragger.onPointerDrag(event, ray);
  }

  public override async onPointerUp(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (this._dragger === undefined) {
      await super.onPointerUp(event, leftButton);
    } else {
      this._dragger.onPointerUp(event);
      this._dragger = undefined;
    }
  }

  // ==================================================
  // VIRTUALS METHODS
  // ==================================================

  /**
   * Override this function to create custom dragger
   * with other creation logic. Otherwise createDragger in
   * the DomainObject itself
   */
  protected async createDragger(event: PointerEvent): Promise<BaseDragger | undefined> {
    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      return undefined;
    }
    if (!isDomainObjectIntersection(intersection)) {
      return undefined;
    }
    const domainObject = intersection.domainObject;
    if (domainObject === undefined) {
      return undefined;
    }
    return domainObject.createDragger(intersection);
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  protected deselectAll(except?: DomainObject | undefined): void {
    const { renderTarget } = this;
    const { rootDomainObject } = renderTarget;
    for (const domainObject of rootDomainObject.getDescendants()) {
      if (except !== undefined && domainObject === except) {
        continue;
      }
      domainObject.setSelectedInteractive(false);
    }
  }
}
