import isUndefined from 'lodash/isUndefined';

export const getLineInfoPosition = (
  graph: HTMLElement | null,
  pointerX?: number,
  lineInfoWidth?: number
) => {
  const chartWidth = graph?.clientWidth;

  if (
    isUndefined(chartWidth) ||
    isUndefined(pointerX) ||
    isUndefined(lineInfoWidth)
  ) {
    return undefined;
  }

  const lineInfoWidthHalf = lineInfoWidth / 2;
  const offsetRight = chartWidth - pointerX;

  if (pointerX < lineInfoWidthHalf) {
    return lineInfoWidthHalf;
  }

  if (offsetRight < lineInfoWidthHalf) {
    return pointerX - (lineInfoWidthHalf - offsetRight);
  }

  return pointerX;
};
