import { Ray, type Vector3 } from 'three';
import {
  type VisualDomainObject,
  type CreateDraggerProps
} from '../domainObjects/VisualDomainObject';
import { type Transaction } from '../undo/Transaction';
import { type UnitSystem } from '../renderTarget/UnitSystem';
import { type DomainObject } from '../domainObjects/DomainObject';
import { Quantity } from './Quantity';
import { round, roundIncrement } from '../utilities/extensions/mathUtils';
import { Changes } from './Changes';
import { getRoot } from '../domainObjects/getRoot';

/**
 * The `BaseDragger` class represents a utility for dragging and manipulating any object in 3D space.
 * It provides methods for onPointerDown, onPointerDrag, and onPointerUp based on user interactions.
 */

export const EPSILON = 0.000001; // Dragger precision for equality checks
export abstract class BaseDragger {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================
  protected readonly point: Vector3; // Intersection point at pointer down in CDF coordinates
  protected readonly ray: Ray = new Ray(); // Intersection point at pointer down in CDF coordinates
  private _transaction?: Transaction;
  protected readonly _unitSystem: UnitSystem | undefined = undefined;
  public isChanged = false;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get transaction(): Transaction | undefined {
    return this._transaction;
  }

  protected set transaction(transaction: Transaction) {
    this._transaction = transaction;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================
  /**
   * Represents a base dragger object.
   * @param props - Contains the ray amd the clicked point in CDF coordinates
   * @param domainObject - The domain object to act on
   */
  protected constructor(props: CreateDraggerProps, domainObject: DomainObject) {
    this.point = props.point;
    this.ray = props.ray;

    const root = getRoot(domainObject);
    if (root !== undefined) {
      this._unitSystem = root.unitSystem;
    }
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  /**
   * Returns the domain object to be manipulated
   */
  public abstract get domainObject(): VisualDomainObject;

  /**
   * Called just after the dragger is created and the pointer is down.
   * @param _event - The pointer event object.
   */
  public onPointerDown(_event: PointerEvent): void {}

  /**
   * Called every times the mouse moves during dragging
   * @param event - The pointer event.
   * @param ray - The current ray in CDF coordinates
   * @returns True if the dragger has changed the domain object, false otherwise.
   */
  public abstract onPointerDrag(event: PointerEvent, ray: Ray): boolean;

  /**
   * Called just before the dragger is deleted.
   * @param _event - The pointer event.
   */
  public onPointerUp(_event: PointerEvent): void {
    if (this.isChanged) {
      this.domainObject.notify(Changes.geometry);
    }
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  protected getBestValue(value: number, isShiftPressed: boolean, minValue: number): number {
    if (value < minValue) {
      value = minValue;
    }
    if (!isShiftPressed || this._unitSystem === undefined) {
      return value;
    }
    const convertedValue = this._unitSystem.convertToUnit(value, Quantity.Length);
    // Divide the box into abound some parts and use that as the increment
    const increment = roundIncrement(convertedValue / 25);
    const roundedValue = round(convertedValue, increment);
    const newValue = this._unitSystem.convertFromUnit(roundedValue, Quantity.Length);
    if (newValue < minValue) {
      return minValue;
    }
    return newValue;
  }
}
