/*!
 * Copyright 2024 Cognite AS
 */

import { type Vector3 } from 'three';
import { type BoxFace } from './BoxFace';
import { type BoxFocusType } from './BoxFocusType';
import { type GeometryType } from './GeometryType';

/**
 * Represents a box in 3D space.
 */
export type IBox = {
  /**
   * The size of the box.
   */
  get size(): Vector3;
  /**
   * The center position of the box.
   */
  get center(): Vector3;
  /**
   * The rotation angle of the box around the z-axis, in radians.
   * The value is in the interval [0, 2*Pi).
   */
  get zRotation(): number;
  /**
   * Sets the rotation angle of the box around the z-axis, in radians.
   * The value should be in the interval [0, 2*Pi).
   * @param value The rotation angle in radians.
   */
  set zRotation(value: number);
  /**
   * Forces the box to have the minimum size allowed.
   */
  forceMinSize: () => void;

  /**
   * The face of the box that is currently in focus when editing in 3D.
   */
  get focusFace(): BoxFace | undefined;
  /**
   * Sets the face of the box that is currently in focus when editing in 3D.
   * @param value The face to set as the focus face.
   */
  set focusFace(value: BoxFace | undefined);
  /**
   * The type of focus for the box when editing in 3D.
   */
  get focusType(): BoxFocusType;
  /**
   * Sets the type of focus for the box when editing in 3D.
   * @param value The focus type to set.
   */
  set focusType(value: BoxFocusType);

  /**
   * Gets the type of geometry for the box
   * @param value The geometry type to set.
   */
  get geometryType(): GeometryType;
};
