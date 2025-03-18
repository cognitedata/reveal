/*!
 * Copyright 2024 Cognite AS
 */

import { type CustomObjectIntersection } from '@cognite/reveal';
import { isDomainObjectIntersection } from '../../../base/domainObjectsHelpers/DomainObjectIntersection';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type PrimitivePickInfo } from '../common/PrimitivePickInfo';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { type BaseCreator } from '../../../base/domainObjectsHelpers/BaseCreator';
import { BaseEditTool } from '../../../base/commands/BaseEditTool';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { CommandsUpdater } from '../../../base/reactUpdaters/CommandsUpdater';
import { CommonRenderStyle } from '../../../base/renderStyles/CommonRenderStyle';
import { VisualDomainObject } from '../../../base/domainObjects/VisualDomainObject';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { SolidDomainObject } from '../common/SolidDomainObject';

export abstract class PrimitiveEditTool extends BaseEditTool {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  protected _creator: BaseCreator | undefined = undefined;
  public primitiveType: PrimitiveType;
  private readonly _defaultPrimitiveType: PrimitiveType;

  public get isSelectMode(): boolean {
    return this.primitiveType === PrimitiveType.None;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(primitiveType: PrimitiveType = PrimitiveType.None) {
    super();
    this.primitiveType = primitiveType;
    this._defaultPrimitiveType = primitiveType;
  }

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override onDeactivate(): void {
    this.escape();
    super.onDeactivate();
  }

  public override clearDragging(): void {
    super.clearDragging();
    this._creator = undefined;
  }

  public override onDeleteKey(): void {
    const domainObject = this.getSelected();
    if (domainObject !== undefined) {
      this.addTransaction(domainObject.createTransaction(Changes.deleted));
      domainObject.removeInteractive();
    }
    this._creator = undefined;
  }

  public override onEscapeKey(): void {
    const wasSelectMode = this.isSelectMode;
    this.escape();
    CommandsUpdater.update(this.renderTarget);
    if (wasSelectMode) {
      super.onEscapeKey();
    }
  }

  public override async onHoverByDebounce(event: PointerEvent): Promise<void> {
    // Handle when creator is set first
    if (!this.isSelectMode) {
      if (this._creator !== undefined) {
        const { _creator: creator } = this;
        if (!creator.preferIntersection) {
          // Hover in the "air"
          const ray = this.getRay(event);
          if (creator.addPoint(ray, undefined, true)) {
            this.setDefaultCursor();
            return;
          }
        }
        const intersection = await this.getIntersection(event);
        if (intersection === undefined) {
          if (creator !== undefined && creator.preferIntersection) {
            // Hover in the "air"
            const ray = this.getRay(event);
            if (creator.addPoint(ray, undefined, true)) {
              this.setDefaultCursor();
              return;
            }
          }
          this.renderTarget.setNavigateCursor();
          return;
        }
        if (this.getIntersectedSelectableDomainObject(intersection) !== undefined) {
          this.renderTarget.setNavigateCursor();
          return;
        }
        const ray = this.getRay(event);
        if (creator.addPoint(ray, intersection.point, true)) {
          this.setDefaultCursor();
          return;
        }
        this.renderTarget.setNavigateCursor();
        return;
      } else {
        if (await this.tryStartOnHover(event)) {
          return;
        }
      }
    }
    const intersection = await this.getIntersection(event);
    const domainObject = this.getIntersectedSelectableDomainObject(intersection);
    if (!isDomainObjectIntersection(intersection) || domainObject === undefined) {
      this.defocusAll();
      if (this.isSelectMode || intersection === undefined) {
        this.renderTarget.setNavigateCursor();
      } else {
        this.setDefaultCursor();
      }
      return;
    }
    this.setFocus(domainObject, intersection);
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const { renderTarget } = this;
    let creator = this._creator;

    // Click in the "air"
    if (creator !== undefined && !creator.preferIntersection) {
      const ray = this.getRay(event);
      if (creator.addPoint(ray)) {
        this.endCreatorIfFinished(creator);
        return;
      }
    }
    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      // Click in the "air"
      return;
    }
    if (creator !== undefined) {
      const ray = this.getRay(event);
      if (creator.addPoint(ray, intersection.point)) {
        this.endCreatorIfFinished(creator);
      }
      return;
    }
    const domainObject = this.getIntersectedSelectableDomainObject(intersection);
    if (domainObject !== undefined) {
      this.deselectAll(domainObject);
      domainObject.setSelectedInteractive(true);
      return;
    }
    if (creator === undefined) {
      creator = this.createCreator();
      if (creator === undefined) {
        await super.onClick(event);
        return;
      }
      const ray = this.getRay(event);
      if (!creator.addPoint(ray, intersection.point)) {
        return;
      }
      const { domainObject } = creator;
      this.initializeStyle(domainObject);
      this.deselectAll();

      const parent = this.getOrCreateParent();
      parent.addChildInteractive(domainObject);
      domainObject.setSelectedInteractive(true);
      domainObject.setVisibleInteractive(true, renderTarget);
      this.addTransaction(domainObject.createTransaction(Changes.added));
      this._creator = creator;
    }
    this.endCreatorIfFinished(creator);
  }

  public override async onLeftPointerDown(event: PointerEvent): Promise<void> {
    if (this._creator !== undefined) {
      return; // Prevent dragging while creating the new
    }
    await super.onLeftPointerDown(event);
  }

  public override onUndo(): void {
    // If a undo is coming, the creator should be ended.
    if (this._creator === undefined) {
      return;
    }
    // End the creator if the domainObject is removed by undo.
    // To check, it doesn't have any parent if it is removed.
    const domainObject = this._creator.domainObject;
    if (domainObject !== undefined && !domainObject.isLegal) {
      if (domainObject.hasParent) {
        domainObject.removeInteractive();
      }
      this._creator = undefined;
    }
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  protected createCreator(): BaseCreator | undefined {
    return undefined;
  }

  protected getOrCreateParent(): DomainObject {
    return this.rootDomainObject;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public escape(): void {
    if (this._creator !== undefined && this._creator.escape()) {
      this.endCreatorIfFinished(this._creator, true);
    } else {
      this.setDefaultPrimitiveType();
      this._creator = undefined;
    }
  }

  private setFocus(domainObject: VisualDomainObject, intersection: CustomObjectIntersection): void {
    if (domainObject instanceof SolidDomainObject) {
      const pickInfo = intersection.userData as PrimitivePickInfo;
      if (pickInfo === undefined) {
        this.defocusAll();
        this.renderTarget.cursor = undefined;
        return;
      }
      this.defocusAll(domainObject);
      domainObject.setFocusInteractive(pickInfo.focusType, pickInfo.face);
    } else {
      this.defocusAll(domainObject);
      domainObject.setFocusInteractive(FocusType.Focus);
    }
    const point = this.renderTarget.convertFromViewerCoordinates(intersection.point);
    this.renderTarget.cursor = domainObject.getEditToolCursor(this.renderTarget, point);
  }

  protected defocusAll(except?: DomainObject | undefined): void {
    for (const domainObject of this.getSelectable()) {
      if (except !== undefined && domainObject === except) {
        continue;
      }
      if (domainObject instanceof VisualDomainObject) {
        domainObject.setFocusInteractive(FocusType.None);
      }
    }
  }

  private initializeStyle(domainObject: DomainObject): void {
    // Just copy the style the depthTest field from any other selectable
    const depthTest = this.getDepthTestOnFirstSelectable();
    if (depthTest === undefined) {
      return;
    }
    const style = domainObject.getRenderStyle();
    if (!(style instanceof CommonRenderStyle)) {
      return;
    }
    style.depthTest = depthTest;
  }

  private getDepthTestOnFirstSelectable(): boolean | undefined {
    for (const otherDomainObject of this.getSelectable()) {
      const otherStyle = otherDomainObject.getRenderStyle();
      if (otherStyle instanceof CommonRenderStyle) {
        return otherStyle.depthTest;
      }
    }
    return undefined;
  }

  protected setDefaultPrimitiveType(): boolean {
    if (this.primitiveType === this._defaultPrimitiveType) {
      return false;
    }
    this.primitiveType = this._defaultPrimitiveType;
    CommandsUpdater.update(this.renderTarget);
    return true;
  }

  protected endCreatorIfFinished(creator: BaseCreator, force = false): void {
    if (force || creator.isFinished) {
      this.setDefaultPrimitiveType();
      this._creator = undefined;
    }
  }

  private async tryStartOnHover(event: PointerEvent): Promise<boolean> {
    const creator = this.createCreator();
    if (creator === undefined || !creator.canStartOnHover) {
      return false;
    }
    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      // Click in the "air"
      return false;
    }
    const ray = this.getRay(event);
    if (!creator.addPoint(ray, intersection.point, true)) {
      return false;
    }
    const { domainObject } = creator;
    this.initializeStyle(domainObject);
    this.deselectAll();

    const parent = this.getOrCreateParent();
    parent.addChildInteractive(domainObject);
    domainObject.setSelectedInteractive(true);
    domainObject.setVisibleInteractive(true, this.renderTarget);
    this.addTransaction(domainObject.createTransaction(Changes.added));
    this._creator = creator;
    return true;
  }
}
