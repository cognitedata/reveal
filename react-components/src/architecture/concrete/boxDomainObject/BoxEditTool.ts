/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { NavigationTool } from '../../base/concreteCommands/NavigationTool';
import { BoxDomainObject } from './BoxDomainObject';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type Tooltip } from '../../base/commands/BaseCommand';
import { type Ray, Vector3, type Intersection, Plane } from 'three';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import {
  type DomainObjectIntersection,
  isDomainObjectIntersection
} from '../../base/domainObjectsHelpers/DomainObjectIntersection';

export class BoxEditTool extends NavigationTool {
  private _useNavigation = false;
  private _dragInfo: DragInfo | undefined = undefined;

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
    const scale = (distance * RADIUS_FACTOR * 3) / 2;
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
    this._useNavigation = true;
    if (intersection === undefined) {
      await super.onPointerDown(event, leftButton);
      return;
    }
    if (!isDomainObjectIntersection(intersection)) {
      return;
    }
    const boxDomainObject = intersection.domainObject as BoxDomainObject;
    if (boxDomainObject === undefined) {
      await super.onPointerDown(event, leftButton);
      return;
    }
    const userData = intersection.userData as Intersection;
    if (userData?.normal === undefined) {
      await super.onPointerDown(event, leftButton);
      return;
    }
    this._dragInfo = new DragInfo(event, intersection);
    this._useNavigation = false;
  }

  public override async onPointerDrag(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (this._useNavigation || this._dragInfo === undefined) {
      await super.onPointerDrag(event, leftButton);
      return;
    }
    const ray = this.getRaycaster(event).ray;
    this._dragInfo.translate(ray);
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

// ==================================================
// HELPER CLASS
// ==================================================

class DragInfo {
  public readonly side: number = 0;
  public readonly boxDomainObject: BoxDomainObject;
  public readonly intersectionNormal: Vector3 = new Vector3();
  public readonly intersectionPoint: Vector3 = new Vector3();
  public readonly scaleOfBox: Vector3 = new Vector3();
  public readonly centerOfBox: Vector3 = new Vector3();
  public readonly planeOfBox: Plane = new Plane();

  public constructor(event: PointerEvent, intersection: DomainObjectIntersection) {
    const userData = intersection.userData as Intersection;
    this.boxDomainObject = intersection.domainObject as BoxDomainObject;
    if (userData?.normal === undefined) {
      return;
    }
    this.side = getSide(userData.normal);
    this.intersectionNormal.copy(userData.normal);
    this.intersectionNormal.applyMatrix4(this.boxDomainObject.matrix);
    this.intersectionNormal.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    this.intersectionNormal.normalize();

    console.log('side', this.side);

    this.intersectionPoint.copy(intersection.point);
    this.scaleOfBox.copy(this.boxDomainObject.scale);
    this.centerOfBox.copy(this.boxDomainObject.center);
    this.planeOfBox.setFromNormalAndCoplanarPoint(this.intersectionNormal, this.intersectionPoint);
  }

  public translate(ray: Ray): void {
    const closest = ray.closestPointToPoint(this.intersectionPoint, new Vector3());
    let deltaScale = this.planeOfBox.distanceToPoint(closest);
    if (Math.abs(deltaScale) < 0.0001) {
      return;
    }
    const deltaCenter = deltaScale / 2;
    if (this.side < 0) {
      deltaScale = -deltaScale;
    }
    const { scale, center } = this.boxDomainObject;
    scale.copy(this.scaleOfBox);
    center.copy(this.centerOfBox);

    const index = Math.abs(this.side) - 1; // Side is +/-1,  +/-2,  +/-3, index is 0, 1, 2
    scale.setComponent(index, deltaScale + scale.getComponent(index));
    center.setComponent(index, deltaCenter + center.getComponent(index));

    this.boxDomainObject.notify(Changes.geometry);
  }
}
