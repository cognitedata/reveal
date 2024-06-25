/*!
 * Copyright 2024 Cognite AS
 */

import { CDF_TO_VIEWER_TRANSFORMATION, type CustomObjectIntersection } from '@cognite/reveal';
import { isDomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { FocusType } from '../../base/domainObjectsHelpers/FocusType';
import { type BoxPickInfo } from '../../base/utilities/box/BoxPickInfo';
import { type Vector3 } from 'three';
import { PrimitiveType } from './PrimitiveType';
import { type BaseCreator } from '../../base/domainObjectsHelpers/BaseCreator';
import { BaseEditTool } from '../../base/commands/BaseEditTool';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { CommandsUpdater } from '../../base/reactUpdaters/CommandsUpdater';
import { BoxDomainObject } from './box/BoxDomainObject';
import { LineDomainObject } from './line/LineDomainObject';
import { CommonRenderStyle } from '../../base/renderStyles/CommonRenderStyle';
import { type VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { PlaneDomainObject } from './plane/PlaneDomainObject';
import { Changes } from '../../base/domainObjectsHelpers/Changes';

export abstract class PrimitiveEditTool extends BaseEditTool {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _creator: BaseCreator | undefined = undefined;
  public primitiveType: PrimitiveType;
  public defaultPrimitiveType: PrimitiveType;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  protected constructor(primitiveType: PrimitiveType = PrimitiveType.None) {
    super();
    this.defaultPrimitiveType = primitiveType;
    this.primitiveType = this.defaultPrimitiveType;
  }

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override onDeactivate(): void {
    this.handleEscape();
    super.onDeactivate();
  }

  public override clearDragging(): void {
    super.clearDragging();
    this._creator = undefined;
  }

  public override onKey(event: KeyboardEvent, down: boolean): void {
    if (down && event.key === 'Delete') {
      const domainObject = this.getSelected();
      if (domainObject !== undefined) {
        this.addTransaction(domainObject.createTransaction(Changes.deleted));
        domainObject.removeInteractive();
      }
      this._creator = undefined;
      return;
    }
    if (down && event.key === 'Escape') {
      this.handleEscape();
    }
    super.onKey(event, down);
  }

  public override async onHover(event: PointerEvent): Promise<void> {
    // Handle when creator is set first
    if (this.primitiveType !== PrimitiveType.None && this._creator !== undefined) {
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
      if (creator.addPoint(ray, intersection, true)) {
        this.setDefaultCursor();
        return;
      }
      this.renderTarget.setNavigateCursor();
      return;
    }
    const intersection = await this.getIntersection(event);
    const domainObject = this.getIntersectedSelectableDomainObject(intersection);
    if (!isDomainObjectIntersection(intersection) || domainObject === undefined) {
      this.defocusAll();
      if (this.primitiveType === PrimitiveType.None || intersection === undefined) {
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
      if (creator.addPoint(ray, undefined)) {
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
      if (creator.addPoint(ray, intersection)) {
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
    const ray = this.getRay(event);
    if (creator === undefined) {
      creator = this._creator = this.createCreator();
      if (creator === undefined) {
        return;
      }
      if (creator.addPoint(ray, intersection)) {
        const { domainObject } = creator;
        this.initializeStyle(domainObject);
        this.deselectAll();

        const parent = this.getOrCreateParent();
        parent.addChildInteractive(domainObject);
        domainObject.setSelectedInteractive(true);
        domainObject.setVisibleInteractive(true, renderTarget);
      } else {
        this._creator = undefined;
        return;
      }
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
    if (this._creator === undefined) {
      return;
    }
    // End the creator if the domainObject is removed by undo.
    // To check, it doesn't have any parent if it is removed.
    const domainObject = this._creator.domainObject;
    if (domainObject === undefined || !domainObject.hasParent) {
      this._creator = undefined;
      this.setDefaultPrimitiveType();
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

  public handleEscape(): void {
    if (this._creator === undefined) {
      return;
    }
    if (this._creator.handleEscape()) {
      this.endCreatorIfFinished(this._creator, true);
    } else {
      this.setDefaultPrimitiveType();
      this._creator = undefined;
    }
  }

  private setCursor(boxDomainObject: BoxDomainObject, point: Vector3, pickInfo: BoxPickInfo): void {
    if (pickInfo.focusType === FocusType.Body) {
      this.renderTarget.setMoveCursor();
    } else if (pickInfo.focusType === FocusType.Face) {
      const matrix = boxDomainObject.getMatrix();
      matrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);

      const boxCenter = boxDomainObject.center.clone();
      const faceCenter = pickInfo.face.getCenter().multiplyScalar(100);
      const size = boxDomainObject.size.getComponent(pickInfo.face.index);
      if (size < 1) {
        // If they are too close, the pixel value will be the same, so multiply faceCenter
        // so it pretend the size is at least 1.
        faceCenter.multiplyScalar(1 / size);
      }
      boxCenter.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
      faceCenter.applyMatrix4(matrix);

      this.renderTarget.setResizeCursor(boxCenter, faceCenter);
    } else if (pickInfo.focusType === FocusType.Corner) {
      const matrix = boxDomainObject.getMatrix();
      matrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);

      const faceCenter = pickInfo.face.getCenter();
      faceCenter.applyMatrix4(matrix);

      this.renderTarget.setResizeCursor(point, faceCenter);
    } else if (pickInfo.focusType === FocusType.Rotation) {
      this.renderTarget.setGrabCursor();
    } else {
      this.setDefaultCursor();
    }
  }

  private setFocus(domainObject: VisualDomainObject, intersection: CustomObjectIntersection): void {
    if (domainObject instanceof LineDomainObject) {
      this.defocusAll(domainObject);
      domainObject.setFocusInteractive(FocusType.Focus);
      this.renderTarget.setDefaultCursor();
    } else if (domainObject instanceof PlaneDomainObject) {
      this.defocusAll(domainObject);
      domainObject.setFocusInteractive(FocusType.Focus);
      this.renderTarget.setMoveCursor();
    } else if (domainObject instanceof BoxDomainObject) {
      const pickInfo = intersection.userData as BoxPickInfo;
      if (pickInfo === undefined) {
        this.defocusAll();
        this.renderTarget.setDefaultCursor();
        return;
      }
      this.setCursor(domainObject, intersection.point, pickInfo);
      this.defocusAll(domainObject);
      domainObject.setFocusInteractive(pickInfo.focusType, pickInfo.face);
    }
  }

  protected defocusAll(except?: DomainObject | undefined): void {
    for (const domainObject of this.getSelectable()) {
      if (except !== undefined && domainObject === except) {
        continue;
      }
      if (domainObject instanceof LineDomainObject) {
        domainObject.setFocusInteractive(FocusType.None);
      } else if (domainObject instanceof PlaneDomainObject) {
        domainObject.setFocusInteractive(FocusType.None);
      } else if (domainObject instanceof BoxDomainObject) {
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

  private setDefaultPrimitiveType(): void {
    if (this.primitiveType === this.defaultPrimitiveType) {
      return;
    }
    this.primitiveType = this.defaultPrimitiveType;
    CommandsUpdater.update(this.renderTarget);
  }

  private endCreatorIfFinished(creator: BaseCreator, force = false): void {
    if (force || creator.isFinished) {
      this.setDefaultPrimitiveType();
      this._creator = undefined;
    } else if (creator.notPendingPointCount < creator.minimumPointCount) {
      return;
    }
    // Add the transaction only when it is legal at the first time.
    const domainObject = creator.domainObject;
    if (domainObject === undefined) {
      return;
    }
    if (this.undoManager === undefined) {
      return;
    }
    const exists = this.undoManager.hasUniqueId(domainObject.uniqueId);
    if (exists) {
      return;
    }
    this.addTransaction(domainObject.createTransaction(Changes.added));
  }
}
