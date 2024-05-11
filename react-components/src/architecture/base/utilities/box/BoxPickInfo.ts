/*!
 * Copyright 2024 Cognite AS
 */

import { type BoxFocusType } from './BoxFocusType';
import { type BoxFace } from './BoxFace';
import { type Vector3 } from 'three';

export class BoxPickInfo {
  public readonly face: BoxFace;
  public readonly focusType: BoxFocusType;
  public readonly cornerSign: Vector3; // Indicate the corner of the face

  public constructor(face: BoxFace, focusType: BoxFocusType, cornerSign: Vector3) {
    this.face = face;
    this.focusType = focusType;
    this.cornerSign = cornerSign;
  }
}
