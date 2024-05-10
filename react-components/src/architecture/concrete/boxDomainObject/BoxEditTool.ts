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
import { clear, replaceLast } from '../../base/utilities/extensions/arrayExtensions';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { addPointsToBox } from '../../base/utilities/box/addPointsToBox';

export class BoxEditTool extends NavigationTool {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _dragger: BoxDragger | undefined = undefined;

  // These are for the pening box:
  private readonly _clickedPoints: Vector3[] = [];
  private _lastIsHovering: boolean = false;
  private _pendingBox: BoxDomainObject | undefined = undefined;

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
    this.setAllBoxesVisible(true);
    this.clearPendingBox();
  }

  public override onDeactivate(): void {
    super.onDeactivate();
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
      this.clearPendingBox();
      return;
    }
    if (down && event.key === 'Escape') {
      if (this._pendingBox !== undefined) {
        if (this._lastIsHovering) {
          this._clickedPoints.pop();
        }
        if (this._clickedPoints.length >= 3) {
          addPointsToBox(this._pendingBox, this._clickedPoints);
          this.setFocus(this._pendingBox, BoxFocusType.Any);
          this._pendingBox.notify(Changes.geometry);
        } else {
          this._pendingBox.removeInteractive();
        }
        this.clearPendingBox();
      }
      return;
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
    if (this._pendingBox !== undefined) {
      if (this._clickedPoints.length >= 1) {
        this.addPoint(intersection, true);
        addPointsToBox(this._pendingBox, this._clickedPoints);
        this._pendingBox.notify(Changes.geometry);
      }
      this.setDefaultCursor();
      this.setFocus(undefined);
      return;
    }
    if (!isDomainObjectIntersection(intersection)) {
      this.setDefaultCursor();
      this.setFocus(undefined);
      super.onHover(event);
      return;
    }
    if (!(intersection.domainObject instanceof BoxDomainObject)) {
      this.setDefaultCursor();
      this.setFocus(undefined);
      super.onHover(event);
      return;
    }
    const pickInfo = intersection.userData as BoxPickInfo;
    if (pickInfo === undefined) {
      this.setDefaultCursor();
      this.setFocus(undefined);
      super.onHover(event);
      return undefined;
    }
    if (pickInfo.focusType === BoxFocusType.Translate) {
      this.renderTarget.setMoveCursor();
    } else if (pickInfo.focusType === BoxFocusType.Scale) {
      const matrix = intersection.domainObject.getMatrix();
      matrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);

      // If they are too close, the pixel value will be the same, so multiply point2 by 100
      const point1 = intersection.domainObject.center.clone();
      const point2 = pickInfo.face.getCenter().multiplyScalar(100);
      point1.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
      point2.applyMatrix4(matrix);

      this.renderTarget.setResizeCursor(point1, point2);
    } else if (pickInfo.focusType === BoxFocusType.Rotate) {
      this.renderTarget.setGrabCursor();
    } else {
      this.setDefaultCursor();
    }
    this.setFocus(intersection.domainObject, pickInfo.focusType, pickInfo.face);
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const { renderTarget } = this;
    const { rootDomainObject } = renderTarget;

    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      await super.onClick(event);
      return;
    }
    this.addPoint(intersection, false);
    const points = this._clickedPoints;
    if (points.length === 1) {
      const pendingBox = new BoxDomainObject();
      addPointsToBox(pendingBox, points);
      rootDomainObject.addChildInteractive(pendingBox);
      this.setFocus(pendingBox, BoxFocusType.Pending);
      pendingBox.setVisibleInteractive(true, renderTarget);
      this._pendingBox = pendingBox;
    } else if (this._pendingBox !== undefined) {
      addPointsToBox(this._pendingBox, points);
      const focusType = points.length === 4 ? BoxFocusType.Any : BoxFocusType.Pending;
      this.setFocus(this._pendingBox, focusType);
      this._pendingBox.notify(Changes.geometry);
      if (points.length === 4) {
        this.clearPendingBox();
      }
    }
  }

  public override async onPointerDown(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (this._pendingBox !== undefined) {
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
    this._dragger.apply(this.getRaycaster(event).ray);
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
    return new BoxDragger(domainObject, intersection.point, pickInfo);
  }

  private addPoint(intersection: AnyIntersection, isHovering: boolean): void {
    const point = intersection.point.clone();
    point.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());
    const points = this._clickedPoints;

    if (this._lastIsHovering) {
      replaceLast(points, point);
    } else {
      points.push(point);
    }
    this._lastIsHovering = isHovering;
  }

  private clearPendingBox(): void {
    clear(this._clickedPoints);
    this._lastIsHovering = false;
    this._pendingBox = undefined;
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
}
