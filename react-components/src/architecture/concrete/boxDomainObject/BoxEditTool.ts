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

// ==================================================
// HELPER CLASS
// ==================================================

class DragInfo {
  private readonly _face: number = 0; // Face is +/-1,  +/-2,  +/-3
  private readonly _boxDomainObject: BoxDomainObject;
  private readonly _intersectionNormal: Vector3 = new Vector3();
  private readonly _intersectionPoint: Vector3 = new Vector3();
  private readonly _scaleOfBox: Vector3 = new Vector3();
  private readonly _centerOfBox: Vector3 = new Vector3();
  private readonly _planeOfBox: Plane = new Plane();
  private readonly _minPoint: Vector3 = new Vector3();
  private readonly _maxPoint: Vector3 = new Vector3();

  public get index(): number {
    return Math.abs(this._face) - 1; // Face is +/-1,  +/-2,  +/-3, index is 0, 1, 2
  }

  public constructor(event: PointerEvent, intersection: DomainObjectIntersection) {
    const userData = intersection.userData as Intersection;
    this._boxDomainObject = intersection.domainObject as BoxDomainObject;
    if (userData?.normal === undefined) {
      return;
    }
    this._face = getFace(userData.normal);
    this._intersectionNormal.copy(userData.normal);
    this._intersectionNormal.applyMatrix4(this._boxDomainObject.matrix);
    this._intersectionNormal.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    this._intersectionNormal.normalize();

    this._intersectionPoint.copy(intersection.point);
    this._minPoint.copy(intersection.point);
    this._maxPoint.copy(intersection.point);

    this._minPoint.addScaledVector(this._intersectionNormal, +intersection.distanceToCamera * 10);
    this._maxPoint.addScaledVector(this._intersectionNormal, -intersection.distanceToCamera * 10);

    this._scaleOfBox.copy(this._boxDomainObject.scale);
    this._centerOfBox.copy(this._boxDomainObject.center);
    this._planeOfBox.setFromNormalAndCoplanarPoint(
      this._intersectionNormal,
      this._intersectionPoint
    );
  }

  public translate(ray: Ray): void {
    const pointOnSegment = new Vector3();
    ray.distanceSqToSegment(this._minPoint, this._maxPoint, undefined, pointOnSegment);
    const deltaScale = this._planeOfBox.distanceToPoint(pointOnSegment);
    if (Math.abs(deltaScale) < 0.00001) {
      return;
    }
    const deltaCenter = (Math.sign(this._face) * deltaScale) / 2;

    // First copy the original values
    const { scale, center } = this._boxDomainObject;
    scale.copy(this._scaleOfBox);
    center.copy(this._centerOfBox);

    // Then change the values
    const index = this.index;
    scale.setComponent(index, deltaScale + scale.getComponent(index));
    center.setComponent(index, deltaCenter + center.getComponent(index));

    // Notify the changes
    this._boxDomainObject.notify(Changes.geometry);
  }
}

function getFace(normal: Vector3): number {
  // Gives 1 for +X axis, -1 for -X axis, 2 for +Y axis, -2 for -Y axis etc
  for (let i = 0; i < 3; i++) {
    const value = normal.getComponent(i);
    if (value !== 0) {
      return (i + 1) * Math.sign(value);
    }
  }
  throw new Error('Invalid normal');
}
