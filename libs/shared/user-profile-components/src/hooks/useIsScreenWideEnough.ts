import { useEffect, useState } from 'react';

import { RESPONSIVE_BREAKPOINT } from '../common/constants/index';

// taken from infield
// https://github.com/cognitedata/industry-apps/blob/master/apps/infield/src/hooks/useIsDesktop.ts
const useIsWiderThanBreakPoints = (...breakPoints: number[]) => {
  const [width, setWidth] = useState(window.innerWidth);

  const updateWidth = () => setWidth(window.innerWidth);

  useEffect(() => {
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return breakPoints.map((breakPoint) => width > breakPoint);
};

export const useIsScreenWideEnough = (): boolean =>
  useIsWiderThanBreakPoints(RESPONSIVE_BREAKPOINT)[0];
