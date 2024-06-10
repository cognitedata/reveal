/*!
 * Copyright 2024 Cognite AS
 */

export enum VisibleState {
  All, // Visible
  Some, // Partly visible
  None, // None visible
  CanNotBeVisibleNow, // Can not be checked on, but it can be visible
  Disabled // Visible disabled, none of the children can be visible or no children
}
