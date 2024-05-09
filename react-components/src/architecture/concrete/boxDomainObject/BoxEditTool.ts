/*!
 * Copyright 2024 Cognite AS
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { NavigationTool } from '../../base/concreteCommands/NavigationTool';
import { BoxDomainObject } from './BoxDomainObject';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type Tooltip } from '../../base/commands/BaseCommand';
import { isDomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { BoxDragger } from '../../base/utilities/box/BoxDragger';
import { type BoxFace } from '../../base/utilities/box/BoxFace';
import { BoxFocusType } from '../../base/utilities/box/BoxFocusType';
import { type BoxPickInfo } from '../../base/utilities/box/BoxPickInfo';
import { Vector3 } from 'three';
import { clear } from '../../base/utilities/extensions/arrayExtensions';

export class BoxEditTool extends NavigationTool {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _dragger: BoxDragger | undefined = undefined;
  private readonly _clickedPoints: Vector3[] = [];

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
      return;
    }
    super.onKey(event, down);
  }

  public override onHover(event: PointerEvent): void {
    const intersection = this.getSpecificIntersection(event, BoxDomainObject);
    if (intersection === undefined) {
      this.setDefaultCursor();
      this.setFocus(undefined);
      return;
    }
    if (!(intersection.domainObject instanceof BoxDomainObject)) {
      this.setDefaultCursor();
      return;
    }
    const pickInfo = intersection.userData as BoxPickInfo;
    if (pickInfo === undefined) {
      this.setDefaultCursor();
      return undefined;
    }
    if (pickInfo.focusType === BoxFocusType.Translate) {
      this.renderTarget.setMoveCursor();
    } else if (pickInfo.focusType === BoxFocusType.Scale) {
      const matrix = intersection.domainObject.getMatrix();
      matrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);

      const point1 = intersection.domainObject.center.clone();
      const point2 = pickInfo.face.getCenter();
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
    if (isDomainObjectIntersection(intersection)) {
      if (intersection.domainObject instanceof BoxDomainObject) {
        await super.onClick(event);
        return;
      }
    }
    this._clickedPoints.push(intersection.point.clone());
    const RADIUS_FACTOR = 0.2 * 5;
    const distance = intersection.distanceToCamera;
    const size = (distance * RADIUS_FACTOR) / 2;

    const boxDomainObject = new BoxDomainObject();

    const center = intersection.point.clone();
    center.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());

    boxDomainObject.size.setScalar(size);
    boxDomainObject.center.copy(center);

    rootDomainObject.addChildInteractive(boxDomainObject);
    boxDomainObject.setVisibleInteractive(true, renderTarget);
    this.setFocus(boxDomainObject, BoxFocusType.Any);

    if (this._clickedPoints.length === 4) {
      clear(this._clickedPoints);
    }
  }

  public override async onPointerDown(event: PointerEvent, leftButton: boolean): Promise<void> {
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

  private setFocus(
    boxDomainObject: BoxDomainObject | undefined,
    focusType: BoxFocusType = BoxFocusType.None,
    face?: BoxFace
  ): void {
    for (const other of this.getAllBoxDomainObjects()) {
      if (boxDomainObject === undefined || other !== boxDomainObject) {
        other.setFocusInteractive(BoxFocusType.None);
      }
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

  public *getAllBoxDomainObjects(): Generator<BoxDomainObject> {
    const { renderTarget } = this;
    const { rootDomainObject } = renderTarget;
    for (const boxDomainObject of rootDomainObject.getDescendantsByType(BoxDomainObject)) {
      yield boxDomainObject;
    }
  }
}
