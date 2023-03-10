import * as React from 'react';
import { useEffect, useState } from 'react';

import { Coordinate } from '../types';
import { createEventListener } from '../utils/createEventListener';

/**
 * THIS SHOULD BE FIXED LATER
 */
export const useCursorPosition = (
  chartRef: React.RefObject<HTMLDivElement>
) => {
  const [cursorPosition, setCursorPosition] = useState<Coordinate>();

  useEffect(() => {
    createEventListener(chartRef.current, 'mousemove', (event: any) => {
      const x = event.clientX - 14; //x position within the element.
      const y = event.clientY; //y position within the element.

      setCursorPosition({ x, y });
    });
  }, []);

  return { cursorPosition };
};
