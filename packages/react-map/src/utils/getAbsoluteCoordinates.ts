import { Position } from '@turf/helpers';

export const getAbsoluteCoordinates = (
  lng: number,
  coordinates: Position
): Position => {
  const position = coordinates;
  while (Math.abs(lng - coordinates[0]) > 180) {
    position[0] += lng > coordinates[0] ? 360 : -360;
  }
  return position;
};
