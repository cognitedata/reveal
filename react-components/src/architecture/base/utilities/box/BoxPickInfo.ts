/*!
 * Copyright 2024 Cognite AS
 */

import { type FocusType } from '../../domainObjectsHelpers/FocusType';
import { type BoxFace } from './BoxFace';
import { type Vector3 } from 'three';

/**
 * Represents information about a picked box.
 */
export class BoxPickInfo {
  /**
   * The face of the box that was picked.
   */
  public readonly face: BoxFace;

  /**
   * The type of focus on the picked box.
   */
  public readonly focusType: FocusType;

  /**
   * Indicates the corner of the face.
   */
  public readonly cornerSign: Vector3;

  /**
   * Creates a new instance of BoxPickInfo.
   * @param face The face of the box that was picked.
   * @param focusType The type of focus on the picked box.
   * @param cornerSign Indicates the corner of the face.
   */
  public constructor(face: BoxFace, focusType: FocusType, cornerSign: Vector3) {
    this.face = face;
    this.focusType = focusType;
    this.cornerSign = cornerSign;
  }
}
