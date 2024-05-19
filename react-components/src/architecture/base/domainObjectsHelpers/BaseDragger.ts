/*!
 * Copyright 2024 Cognite AS
 */

import { type Ray, Vector3 } from 'three';
import { type DomainObject } from '../domainObjects/DomainObject';

/**
 * The `BaseDragger` class represents a utility for dragging and manipulating any object in 3D space.
 * It provides methods for onPointerDown, onPointerDrag, and onPointerUp based on user interactions.
 */
export abstract class BaseDragger {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly point: Vector3 = new Vector3(); // Intersection point at pointer down

  // ==================================================
  // CONTRUCTOR
  // ==================================================

  protected constructor(startDragPoint: Vector3) {
    this.point.copy(startDragPoint);
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  public abstract get domainObject(): DomainObject;

  public onPointerDown(_event: PointerEvent): void {
    // Empty, probably not needed
  }

  public onPointerUp(_event: PointerEvent): void {
    // Empty, probably not needed
  }

  // This must be overriden
  public abstract onPointerDrag(_event: PointerEvent, ray: Ray): boolean;
}
