import isUndefined from 'lodash/isUndefined';

import { Coordinate } from '../types';
import { isInRange } from './isInRange';

export const checkIsClientOnElementt = (
  position: Coordinate,
  plotBounds?: DOMRect
) => {
  if (isUndefined(position.x) || isUndefined(position.y) || !plotBounds) {
    return false;
  }

  const { x, y } = position;
  const { top, bottom, left, right } = plotBounds;

  return (
    isInRange({
      value: x,
      min: left,
      max: right,
    }) &&
    isInRange({
      value: y,
      min: top,
      max: bottom,
    })
  );
};
