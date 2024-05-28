/*!
 * Copyright 2024 Cognite AS
 */

import { Ray, type Vector3 } from 'three';
import { type DomainObject } from '../domainObjects/DomainObject';
import { type CreateDraggerProps } from '../domainObjects/VisualDomainObject';

/**
 * The `BaseDragger` class represents a utility for dragging and manipulating any object in 3D space.
 * It provides methods for onPointerDown, onPointerDrag, and onPointerUp based on user interactions.
 */
export abstract class BaseDragger {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  protected readonly point: Vector3; // Intersection point at pointer down in CDF coordinates
  protected readonly ray: Ray = new Ray(); // Intersection point at pointer down in CDF coordinates

  // ==================================================
  // CONTRUCTOR
  // ==================================================

  protected constructor(props: CreateDraggerProps) {
    // Note: that yje point and the ray comes in CDF coordinates
    this.point = props.point;
    this.ray = props.ray;
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  public abstract get domainObject(): DomainObject;

  public onPointerDown(_event: PointerEvent): void {
    // Empty, probably not needed
  }

  // This must be overriden
  // Note: that the ray comes in CDF coordinates
  public abstract onPointerDrag(_event: PointerEvent, ray: Ray): boolean;

  public onPointerUp(_event: PointerEvent): void {
    // Empty, probably not needed
  }
}
