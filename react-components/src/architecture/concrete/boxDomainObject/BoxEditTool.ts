/*!
 * Copyright 2024 Cognite AS
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { NavigationTool } from '../../base/concreteCommands/NavigationTool';
import { BoxDomainObject } from './BoxDomainObject';
import { type AnyIntersection, CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type Tooltip } from '../../base/commands/BaseCommand';
import { isDomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { BoxDragger } from '../../base/utilities/box/BoxDragger';
import { type BoxFace } from '../../base/utilities/box/BoxFace';
import { BoxFocusType } from '../../base/utilities/box/BoxFocusType';
import { type BoxPickInfo } from '../../base/utilities/box/BoxPickInfo';
import { type Vector3 } from 'three';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { PendingBox } from './PendingBox';

export class BoxEditTool extends NavigationTool {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _dragger: BoxDragger | undefined = undefined;
  private _pending: PendingBox | undefined = undefined;

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get shortCutKey(): string | undefined {
    return 'I';
  }

  public override get icon(): string {
    return 'Cube';
  }

  public override get tooltip(): Tooltip {
    return { key: 'UNKNOWN', fallback: 'Create or edit a box' };
  }

  public get defaultCursor(): string {
    return 'crosshair';
  }

  public override onActivate(): void {
    super.onActivate();
    this._dragger = undefined;
    this._pending = undefined;
    this.setAllBoxesVisible(true);
  }

  public override onDeactivate(): void {
    super.onDeactivate();
    this._dragger = undefined;
    this._pending = undefined;
    this.setAllBoxesVisible(false);
  }

  public override onKey(event: KeyboardEvent, down: boolean): void {
    if (down && event.key === 'Delete') {
      for (const boxDomainObject of this.getAllBoxDomainObjects()) {
        if (!boxDomainObject.hasFocus) {
          continue;
        }
        boxDomainObject.removeInteractive();
      }
      this._pending = undefined;
      return;
    }
    if (down && event.key === 'Escape') {
      const { _pending: pending } = this;
      if (pending !== undefined) {
        pending.removeLastHovering();
        if (pending.hasEnoughPoints) {
          pending.rebuild();
          this.setFocus(pending.boxDomainObject, BoxFocusType.Any);
          pending.boxDomainObject.notify(Changes.geometry);
        } else {
          // Just one or two points, remove it
          pending.boxDomainObject.removeInteractive();
        }
        this._pending = undefined;
        return;
      }
    }
    super.onKey(event, down);
  }

  public override async onHover(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      this.renderTarget.setNavigateCursor();
      this.setFocus(undefined);
      super.onHover(event);
      return;
    }
    const { _pending: pending } = this;
    if (pending !== undefined) {
      if (this.isBoxDomainObject(intersection)) {
        this.setDefaultCursor();
        this.setFocus(undefined);
        return;
      }
      if (pending !== undefined) {
        pending.addPoint(intersection.point, true);
        pending.boxDomainObject.notify(Changes.geometry);
      }
      this.setDefaultCursor();
      this.setFocus(undefined);
      return;
    }
    if (!isDomainObjectIntersection(intersection)) {
      this.setDefaultCursor();
      this.setFocus(undefined);
      return;
    }
    if (!(intersection.domainObject instanceof BoxDomainObject)) {
      this.setDefaultCursor();
      this.setFocus(undefined);
      return;
    }
    const pickInfo = intersection.userData as BoxPickInfo;
    if (pickInfo === undefined) {
      this.setDefaultCursor();
      this.setFocus(undefined);
      return;
    }
    this.setCursor(intersection.domainObject, intersection.point, pickInfo);
    this.setFocus(intersection.domainObject, pickInfo.focusType, pickInfo.face);
  }

  public override async onDoubleClick(event: PointerEvent): Promise<void> {
    const { renderTarget } = this;
    const { rootDomainObject } = renderTarget;

    const intersection = await this.getIntersection(event);
    // Do not want to click on other boxes
    if (intersection === undefined || this.isBoxDomainObject(intersection)) {
      await super.onDoubleClick(event);
      return;
    }
    const pendingBox = new BoxDomainObject();
    const center = intersection.point;
    center.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());
    pendingBox.center.copy(center);
    pendingBox.size.set(2, 3, 1);
    rootDomainObject.addChildInteractive(pendingBox);
    this.setFocus(pendingBox, BoxFocusType.Any);
    pendingBox.setVisibleInteractive(true, renderTarget);
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const { renderTarget } = this;
    const { rootDomainObject } = renderTarget;

    const intersection = await this.getIntersection(event);
    // Do not want to click on other boxes
    if (intersection === undefined || this.isBoxDomainObject(intersection)) {
      await super.onClick(event);
      return;
    }
    if (this._pending === undefined) {
      const pendingBox = new BoxDomainObject();
      this._pending = new PendingBox(pendingBox);
      this._pending.addPoint(intersection.point, false);
      rootDomainObject.addChildInteractive(pendingBox);
      this.setFocus(pendingBox, BoxFocusType.Pending);
      pendingBox.setVisibleInteractive(true, renderTarget);
    } else {
      const { _pending: pending } = this;
      pending.addPoint(intersection.point, false);
      const focusType = pending.countPoint === 4 ? BoxFocusType.Any : BoxFocusType.Pending;
      this.setFocus(pending.boxDomainObject, focusType);
      pending.boxDomainObject.notify(Changes.geometry);

      if (pending.countPoint === 4) {
        this._pending = undefined;
      }
    }
  }

  public override async onPointerDown(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (this._pending !== undefined) {
      await super.onPointerDown(event, leftButton);
      return;
    }
    this._dragger = await this.createDragInfo(event);
    if (this._dragger === undefined) {
      await super.onPointerDown(event, leftButton);
    } else {
      const boxDomainObject = this._dragger.domainObject as BoxDomainObject;
      this.setFocus(boxDomainObject, this._dragger.focusType, this._dragger.face);
    }
  }

  public override async onPointerDrag(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (this._dragger === undefined) {
      await super.onPointerDrag(event, leftButton);
      return;
    }
    const ray = this.getRaycaster(event).ray.clone();
    ray.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());
    this._dragger.apply(ray);
  }

  public override async onPointerUp(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (this._dragger === undefined) {
      await super.onPointerUp(event, leftButton);
    } else {
      this._dragger = undefined;
    }
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private async createDragInfo(event: PointerEvent): Promise<BoxDragger | undefined> {
    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      return undefined;
    }
    if (!isDomainObjectIntersection(intersection)) {
      return undefined;
    }
    const domainObject = intersection.domainObject;
    if (!(domainObject instanceof BoxDomainObject)) {
      return undefined;
    }
    const pickInfo = intersection.userData as BoxPickInfo;
    if (pickInfo === undefined) {
      return undefined;
    }
    const point = intersection.point;
    point.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());
    return new BoxDragger(domainObject, point, pickInfo);
  }

  private setFocus(
    boxDomainObject: BoxDomainObject | undefined,
    focusType: BoxFocusType = BoxFocusType.None,
    face?: BoxFace
  ): void {
    for (const other of this.getAllBoxDomainObjects()) {
      if (other.focusType === BoxFocusType.Pending) {
        continue;
      }
      if (boxDomainObject !== undefined && other === boxDomainObject) {
        continue;
      }
      other.setFocusInteractive(BoxFocusType.None);
    }
    if (boxDomainObject !== undefined) {
      boxDomainObject.setFocusInteractive(focusType, face);
    }
  }

  private setAllBoxesVisible(visible: boolean): void {
    for (const boxDomainObject of this.getAllBoxDomainObjects()) {
      boxDomainObject.setVisibleInteractive(visible, this.renderTarget);
    }
  }

  private *getAllBoxDomainObjects(): Generator<BoxDomainObject> {
    const { renderTarget } = this;
    const { rootDomainObject } = renderTarget;
    for (const boxDomainObject of rootDomainObject.getDescendantsByType(BoxDomainObject)) {
      yield boxDomainObject;
    }
  }

  private isBoxDomainObject(intersection: AnyIntersection): boolean {
    // Do not want to click on other boxes
    if (!isDomainObjectIntersection(intersection)) {
      return false;
    }
    const domainObject = intersection.domainObject;
    return domainObject instanceof BoxDomainObject;
  }

  private setCursor(boxDomainObject: BoxDomainObject, point: Vector3, pickInfo: BoxPickInfo): void {
    if (pickInfo.focusType === BoxFocusType.Translate) {
      this.renderTarget.setMoveCursor();
    } else if (pickInfo.focusType === BoxFocusType.ResizeByEdge) {
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
    } else if (pickInfo.focusType === BoxFocusType.ResizeByCorner) {
      const matrix = boxDomainObject.getMatrix();
      matrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);

      const faceCenter = pickInfo.face.getCenter();
      faceCenter.applyMatrix4(matrix);

      this.renderTarget.setResizeCursor(point, faceCenter);
    } else if (pickInfo.focusType === BoxFocusType.Rotate) {
      this.renderTarget.setGrabCursor();
    } else {
      this.setDefaultCursor();
    }
  }
}
