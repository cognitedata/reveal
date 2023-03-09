export const getLineInfoPosition = (
  graph: HTMLElement | null,
  pointerX: number = 0,
  lineInfoWidth: number = 0
) => {
  const chartWidth = graph?.clientWidth || 0;
  const lineInfoWidthHalf = lineInfoWidth / 2;
  const offsetRight = chartWidth - pointerX;

  let lineInfoLeft = pointerX;
  let lineInfoOffset = 0;

  if (pointerX < lineInfoWidthHalf) {
    lineInfoLeft = lineInfoWidthHalf;
    lineInfoOffset = pointerX - lineInfoWidthHalf;
  }

  if (offsetRight < lineInfoWidthHalf) {
    lineInfoLeft = pointerX - (lineInfoWidthHalf - offsetRight);
    lineInfoOffset = lineInfoWidthHalf - offsetRight;
  }

  return { lineInfoLeft, lineInfoOffset };
};
