/*!
 * Copyright 2024 Cognite AS
 */

import { Ray, type Vector3 } from 'three';
import {
  type VisualDomainObject,
  type CreateDraggerProps
} from '../domainObjects/VisualDomainObject';

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
  // CONSTRUCTOR
  // ==================================================
  /**
   * Represents a base dragger object.
   * @param props - Contains the ray amd the clicked point in CDF coordinates
   */
  protected constructor(props: CreateDraggerProps) {
    this.point = props.point;
    this.ray = props.ray;
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
  public onPointerUp(_event: PointerEvent): void {}
}
