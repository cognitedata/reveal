import { RefObject } from 'react';

export const getCursorPosition = (
  chartRef: RefObject<HTMLDivElement>,
  event: MouseEvent
) => {
  const chartBounds = chartRef.current?.getBoundingClientRect();

  if (!chartBounds) {
    return undefined;
  }

  const x = event.clientX - chartBounds.left;
  const y = event.clientY - chartBounds.top;

  return { x, y };
};
