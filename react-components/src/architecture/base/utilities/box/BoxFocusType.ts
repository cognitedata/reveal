/*!
 * Copyright 2024 Cognite AS
 */

export enum BoxFocusType {
  None,
  Rotate,
  Translate,
  ResizeByEdge,
  ResizeByCorner,
  Pending, // This only indicates focus during creation
  Any // This only indicates focus when it is created
}
