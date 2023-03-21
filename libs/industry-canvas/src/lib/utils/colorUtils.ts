import assertNever from './assertNever';
import { ShapeAnnotationColor } from '../types';
import { Colors } from '@cognite/cogs.js';

const getRGBA = (rgbString: string, alpha: number): string => {
  return rgbString.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
};

const fillShapeAnnotationColorHexRaw = (
  color: ShapeAnnotationColor
): string => {
  switch (color) {
    case ShapeAnnotationColor.BLUE:
      return Colors['decorative--blue--300'];
    case ShapeAnnotationColor.GREEN:
      return Colors['decorative--green--300'];
    case ShapeAnnotationColor.ORANGE:
      return Colors['decorative--orange--300'];
    case ShapeAnnotationColor.RED:
      return Colors['decorative--red--300'];
    case ShapeAnnotationColor.YELLOW:
      return Colors['decorative--yellow--300'];
    default:
      assertNever(color, 'No hex string for color ' + color);
  }
};

export const fillShapeAnnotationColorToHex = (
  color: ShapeAnnotationColor
): string => {
  return getRGBA(fillShapeAnnotationColorHexRaw(color), 0.9);
};

export const strokeShapeAnnotationColorToHex = (
  color: ShapeAnnotationColor
): string => {
  switch (color) {
    case ShapeAnnotationColor.BLUE:
      return Colors['decorative--blue--600'];
    case ShapeAnnotationColor.GREEN:
      return Colors['decorative--green--600'];
    case ShapeAnnotationColor.ORANGE:
      return Colors['decorative--orange--600'];
    case ShapeAnnotationColor.RED:
      return Colors['decorative--red--600'];
    case ShapeAnnotationColor.YELLOW:
      return Colors['decorative--yellow--600'];
    default:
      assertNever(color, 'No hex string for color ' + color);
  }
};
