import { type Ray, Plane, type Box3 } from 'three';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type PlaneDomainObject } from './PlaneDomainObject';
import { BaseDragger, EPSILON } from '../../../base/domainObjectsHelpers/BaseDragger';
import {
  type VisualDomainObject,
  type CreateDraggerProps
} from '../../../base/domainObjects/VisualDomainObject';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { getClosestPointOnLine } from '../../../base/utilities/extensions/rayUtils';
import { getRoot } from '../../../base/domainObjects/getRoot';
import { isAbsEqual } from '../../../base/utilities/extensions/mathUtils';

/**
 * The `PlaneDragger` class represents a utility for dragging and manipulating a plane in a 3D space.
 * All geometry in this class assume Z-axis is up
 */
export class PlaneDragger extends BaseDragger {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _domainObject: PlaneDomainObject;
  private readonly _plane: Plane;

  // Constrain the plane inside this box
  private readonly _boundingBox: Box3 | undefined = undefined;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(props: CreateDraggerProps, domainObject: PlaneDomainObject) {
    super(props, domainObject);

    this._domainObject = domainObject;
    this._plane = this._domainObject.plane.clone();

    const root = getRoot(this._domainObject);
    if (root === undefined) {
      return;
    }
    const boundingBox = root.renderTarget.sceneBoundingBox;
    this._boundingBox = boundingBox.clone();
    this._boundingBox.applyMatrix4(root.renderTarget.fromViewerMatrix);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get domainObject(): VisualDomainObject {
    return this._domainObject;
  }

  public override onPointerDown(_event: PointerEvent): void {
    this._domainObject.setFocusInteractive(FocusType.Focus);
  }

  public override onPointerDrag(_event: PointerEvent, ray: Ray): boolean {
    const newPoint = getClosestPointOnLine(ray, this._plane.normal, this.point);

    // Constrain the plane to inside the sceneBoundingBox
    if (this._boundingBox !== undefined && !this._boundingBox.containsPoint(newPoint)) {
      return false;
    }
    const newPlane = new Plane().setFromNormalAndCoplanarPoint(this._plane.normal, newPoint);
    if (
      newPlane.equals(this._domainObject.plane) ||
      isAbsEqual(newPlane.constant, this._domainObject.plane.constant, EPSILON)
    ) {
      return false; // No change
    }
    if (this.transaction === undefined) {
      this.transaction = this._domainObject.createTransaction(Changes.geometry);
    }
    this._domainObject.plane.copy(newPlane);
    this._domainObject.makeFlippingConsistent();
    this.domainObject.notify(Changes.dragging);
    return true;
  }
}
