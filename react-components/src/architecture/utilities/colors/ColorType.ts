/*!
 * Copyright 2024 Cognite AS
 */

export enum ColorType {
  ColorMap, // Color by the given color map
  Specified, // Use the color of the node
  Parent, // Use the color of the parent node
  Black,
  White,
  Different // Use different colors (normally use for debugging)
}
