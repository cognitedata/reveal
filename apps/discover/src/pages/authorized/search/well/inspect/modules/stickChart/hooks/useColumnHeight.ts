import { useCallback, useEffect, useRef, useState } from 'react';

import {
  SCALE_BLOCK_HEIGHT,
  SCALE_PADDING,
} from '../../common/Events/constants';
import { DEPTH_SCALE_MIN_HEIGHT } from '../WellboreStickChart/constants';

export const useColumnHeight = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  const [columnHeight, setColumnHeight] = useState(0);

  const updateColumnHeight = useCallback(() => {
    const depthColumnHeight = contentRef.current?.offsetHeight;
    const height = depthColumnHeight || DEPTH_SCALE_MIN_HEIGHT;
    const columnHeight = height - SCALE_BLOCK_HEIGHT - SCALE_PADDING;
    setColumnHeight(columnHeight);
  }, [contentRef.current]);

  useEffect(() => {
    window.addEventListener('resize', updateColumnHeight);
    return () => window.removeEventListener('resize', updateColumnHeight);
  }, []);

  useEffect(() => {
    updateColumnHeight();
  }, [updateColumnHeight]);

  return { contentRef, columnHeight };
};
