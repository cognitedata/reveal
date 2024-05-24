/*!
 * Copyright 2024 Cognite AS
 */

export enum BoxFocusType {
  None,
  Body, // Pick on any other places
  Face,
  Corner,
  RotationRing,
  Pending, // Focus during creation
  JustCreated // Focus when it is created, but not picked on any particalar place
}
