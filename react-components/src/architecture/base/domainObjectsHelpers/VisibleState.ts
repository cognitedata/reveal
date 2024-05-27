/*!
 * Copyright 2024 Cognite AS
 */

export enum VisibleState {
  All, // Visible
  Some, // Partly visible
  None, // None visible
  CanNotBeChecked, // Can not be checked on, but it can be visible
  Disabled // Visiable disabled
}
