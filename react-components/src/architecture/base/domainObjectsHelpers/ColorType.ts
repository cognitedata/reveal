/*!
 * Copyright 2024 Cognite AS
 */

export enum ColorType {
  Specified, // Use the color of the domain object itself
  Parent, // Use the color of the parent domain object
  Black,
  White,
  Different, // Use different colors (normally use for debugging)
  ColorMap // Color by the given color map
}
