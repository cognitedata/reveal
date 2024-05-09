/*!
 * Copyright 2024 Cognite AS
 */

import { type BoxFocusType } from './BoxFocusType';
import { type BoxFace } from './BoxFace';

export class BoxPickInfo {
  public readonly face: BoxFace;
  public readonly focusType: BoxFocusType;

  public constructor(face: BoxFace, focusType: BoxFocusType) {
    this.face = face;
    this.focusType = focusType;
  }
}
