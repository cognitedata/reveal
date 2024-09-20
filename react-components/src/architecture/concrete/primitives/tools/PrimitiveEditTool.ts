/*!
 * Copyright 2024 Cognite AS
 */

import { CDF_TO_VIEWER_TRANSFORMATION, type CustomObjectIntersection } from '@cognite/reveal';
import { isDomainObjectIntersection } from '../../../base/domainObjectsHelpers/DomainObjectIntersection';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type PrimitivePickInfo } from '../common/PrimitivePickInfo';
import { Line3, Vector3 } from 'three';
import { PrimitiveType } from '../common/PrimitiveType';
import { type BaseCreator } from '../../../base/domainObjectsHelpers/BaseCreator';
import { BaseEditTool } from '../../../base/commands/BaseEditTool';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { CommandsUpdater } from '../../../base/reactUpdaters/CommandsUpdater';
import { LineDomainObject } from '../line/LineDomainObject';
import { CommonRenderStyle } from '../../../base/renderStyles/CommonRenderStyle';
import { type VisualDomainObject } from '../../../base/domainObjects/VisualDomainObject';
import { PlaneDomainObject } from '../plane/PlaneDomainObject';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type BaseTool } from '../../../base/commands/BaseTool';
import { SolidDomainObject } from '../common/SolidDomainObject';
import { BoxDomainObject } from '../box/BoxDomainObject';
import { CylinderDomainObject } from '../cylinder/CylinderDomainObject';

export abstract class PrimitiveEditTool extends BaseEditTool {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _creator: BaseCreator | undefined = undefined;
  public primitiveType: PrimitiveType;
  public readonly defaultPrimitiveType: PrimitiveType;

  public get isEdit(): boolean {
    return this.primitiveType === PrimitiveType.None;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(primitiveType: PrimitiveType = PrimitiveType.None) {
    super();
    this.primitiveType = primitiveType;
    this.defaultPrimitiveType = primitiveType;
  }

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override onDeactivate(): void {
    this.onEscapeKey();
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
    if (this._creator !== undefined && this._creator.onEscapeKey()) {
      this.endCreatorIfFinished(this._creator, true);
    } else {
      this.setDefaultPrimitiveType();
      this._creator = undefined;
    }
  }

  public override async onHover(event: PointerEvent): Promise<void> {
    // Handle when creator is set first
    if (!this.isEdit && this._creator !== undefined) {
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
      if (this.isEdit || intersection === undefined) {
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
        this.addTransaction(domainObject.createTransaction(Changes.added));
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

  private setFocus(domainObject: VisualDomainObject, intersection: CustomObjectIntersection): void {
    if (domainObject instanceof LineDomainObject) {
      this.defocusAll(domainObject);
      domainObject.setFocusInteractive(FocusType.Focus);
      this.renderTarget.setDefaultCursor();
    } else if (domainObject instanceof PlaneDomainObject) {
      this.defocusAll(domainObject);
      domainObject.setFocusInteractive(FocusType.Focus);
      this.renderTarget.setMoveCursor();
    } else if (domainObject instanceof SolidDomainObject) {
      const pickInfo = intersection.userData as PrimitivePickInfo;
      if (pickInfo === undefined) {
        this.defocusAll();
        this.renderTarget.setDefaultCursor();
        return;
      }
      PrimitiveEditTool.setCursor(this, domainObject, intersection.point, pickInfo);
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
      } else if (domainObject instanceof SolidDomainObject) {
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
    }
  }

  // ==================================================
  // STATIC METHODS
  // ==================================================

  public static setCursor(
    tool: BaseTool,
    domainObject: SolidDomainObject,
    point: Vector3,
    pickInfo: PrimitivePickInfo
  ): void {
    if (domainObject instanceof BoxDomainObject) {
      PrimitiveEditTool.setCursorForBox(tool, domainObject, point, pickInfo);
    } else if (domainObject instanceof CylinderDomainObject) {
      PrimitiveEditTool.setCursorForCylinder(tool, domainObject, point, pickInfo);
    }
  }

  private static setCursorForBox(
    tool: BaseTool,
    domainObject: BoxDomainObject,
    point: Vector3,
    pickInfo: PrimitivePickInfo
  ): void {
    if (pickInfo.focusType === FocusType.Body) {
      tool.renderTarget.setMoveCursor();
    } else if (pickInfo.focusType === FocusType.Face) {
      const center = domainObject.box.center.clone();
      center.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

      const faceCenter = pickInfo.face.getCenter();
      const matrix = domainObject.box.getMatrix();
      faceCenter.applyMatrix4(matrix);
      faceCenter.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

      tool.renderTarget.setResizeCursor(center, faceCenter);
    } else if (pickInfo.focusType === FocusType.Corner) {
      const faceCenter = pickInfo.face.getCenter();
      const matrix = domainObject.box.getMatrix();
      faceCenter.applyMatrix4(matrix);
      faceCenter.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

      tool.renderTarget.setResizeCursor(point, faceCenter);
    } else if (pickInfo.focusType === FocusType.Rotation) {
      tool.renderTarget.setGrabCursor();
    } else {
      tool.setDefaultCursor();
    }
  }

  private static setCursorForCylinder(
    tool: BaseTool,
    domainObject: CylinderDomainObject,
    point: Vector3,
    pickInfo: PrimitivePickInfo
  ): void {
    if (pickInfo.focusType === FocusType.Body) {
      tool.renderTarget.setMoveCursor();
    } else if (pickInfo.focusType === FocusType.Face) {
      const { cylinder } = domainObject;

      if (pickInfo.face.index === 2) {
        const centerA = cylinder.centerA.clone();
        const centerB = cylinder.centerB.clone();
        centerA.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
        centerB.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
        tool.renderTarget.setResizeCursor(centerA, centerB);
      } else {
        const centerA = cylinder.centerA.clone();
        const centerB = cylinder.centerB.clone();
        centerA.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
        centerB.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

        const axis = new Line3(centerA, centerB);
        const closestOnAxis = axis.closestPointToPoint(point, false, new Vector3());
        tool.renderTarget.setResizeCursor(point, closestOnAxis);
      }
    } else if (pickInfo.focusType === FocusType.Rotation) {
      tool.renderTarget.setGrabCursor();
    } else {
      tool.setDefaultCursor();
    }
  }
}
