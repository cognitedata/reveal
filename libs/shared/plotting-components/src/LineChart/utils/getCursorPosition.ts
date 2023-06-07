import { RefObject } from 'react';

export const getCursorPosition = (
  chartRef: RefObject<HTMLDivElement>,
  event: MouseEvent
) => {
  if (!chartRef.current) {
    return undefined;
  }

  const chartBounds = chartRef.current.getBoundingClientRect();
  const { offsetParent } = chartRef.current;
  let x = event.clientX - chartBounds.left;
  let y = event.clientY - chartBounds.top;
  const transform = offsetParent && getComputedStyle(offsetParent).transform;
  if (!transform || transform === 'none') {
    return { x, y };
  }

  const scaleX = parseFloat(transform.split(',')[0].slice(7));
  const scaleY = parseFloat(transform.split(',')[3]);

  x /= scaleX;
  y /= scaleY;

  return { x, y };
};
