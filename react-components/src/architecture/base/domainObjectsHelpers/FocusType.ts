/*!
 * Copyright 2024 Cognite AS
 */

export enum FocusType {
  None,
  Focus, // Focus not any particular place
  Face, // Focus on the face
  Corner, // Focus on a corner
  Rotation, // Focus at rotation
  Body, // Pick on any other places then Face, Corner or Rotation
  Pending // Focus during creation, made to stop picking during creation of an object
}
