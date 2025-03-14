/*!
 * Copyright 2024 Cognite AS
 */

export function getResizeCursor(octant: number): string | undefined {
  // https://developer.mozilla.org/en-US/docs/Web/CSS/cursor

  switch (octant) {
    case 2:
    case 6:
      return 'ns-resize';

    case 1:
    case 5:
      return 'nesw-resize';

    case 0:
    case 4:
      return 'ew-resize';

    case 3:
    case 7:
      return 'nwse-resize';

    default:
      return undefined;
  }
}
