/**
 * Returns the appropriate CSS cursor value based on the given octant.
 *
 * The octant is a number from 0 to 7 that represents a direction for resizing.
 * The function maps these octants to corresponding CSS cursor values.
 *
 * @param octant - A number from 0 to 7 representing the direction for resizing.
 * @returns The CSS cursor value as a string, or `undefined` if the octant is not valid.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
 */
export function getResizeCursor(octant: number): string | undefined {
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
