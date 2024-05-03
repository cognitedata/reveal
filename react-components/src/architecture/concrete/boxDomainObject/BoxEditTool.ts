/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { NavigationTool } from '../../base/concreteCommands/NavigationTool';
import { BoxDomainObject } from './BoxDomainObject';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type Tooltip } from '../../base/commands/BaseCommand';
import { type Vector3, type Intersection } from 'three';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { isDomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';

export class BoxEditTool extends NavigationTool {
  _useNavigation = false;
  _side: number | undefined = undefined;
  _boxDomainObject: BoxDomainObject | undefined = undefined;
  _startDrag: Vector3 | undefined = undefined;

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

  public override async onClick(event: PointerEvent): Promise<void> {
    const { renderTarget } = this;
    const { rootDomainObject } = renderTarget;

    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      return;
    }
    const RADIUS_FACTOR = 0.2;
    const distance = intersection.distanceToCamera;
    const scale = (distance * RADIUS_FACTOR) / 2;
    const boxDomainObject = new BoxDomainObject();

    const center = intersection.point.clone();
    center.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());

    boxDomainObject.scale.setScalar(scale);
    boxDomainObject.center.copy(center);

    rootDomainObject.addChildInteractive(boxDomainObject);
    boxDomainObject.setVisibleInteractive(true, renderTarget);
  }

  public override async onPointerDown(event: PointerEvent, leftButton: boolean): Promise<void> {
    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      this._useNavigation = true;
      await super.onPointerDown(event, leftButton);
      return;
    }
    if (!isDomainObjectIntersection(intersection)) {
      return;
    }
    const boxDomainObject = intersection.domainObject as BoxDomainObject;
    if (boxDomainObject === undefined) {
      this._useNavigation = true;
      await super.onPointerDown(event, leftButton);
      return;
    }
    if (intersection?.type !== 'customObject') {
      return undefined;
    }
    const userData = intersection.userData as Intersection;
    if (userData?.normal === undefined) {
      return;
    }
    this._side = getSide(userData.normal);
    this._boxDomainObject = boxDomainObject;
    this._startDrag = intersection.point;
  }

  public override async onPointerDrag(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (this._useNavigation) {
      await super.onPointerDrag(event, leftButton);
    }
    if (
      this._boxDomainObject === undefined ||
      this._startDrag === undefined ||
      this._side === undefined
    ) {
      return;
    }

    this._boxDomainObject.center.addScalar(0.01);
    this._boxDomainObject.notify(Changes.geometry);
  }

  public override async onPointerUp(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (this._useNavigation) {
      await super.onPointerUp(event, leftButton);
    }
  }
}

function getSide(normal: Vector3): number {
  // Gives 1 for X+ axis, -1 for X- axis, 2 for Y+ axis, -2 for Y- axis etc
  if (normal.x !== 0) {
    return Math.sign(normal.x);
  }
  if (normal.y !== 0) {
    return 2 * Math.sign(normal.y);
  }
  if (normal.z !== 0) {
    return 3 * Math.sign(normal.z);
  }
  throw new Error('Invalid normal');
}
