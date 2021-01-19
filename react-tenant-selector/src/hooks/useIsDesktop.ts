import { useState, useEffect } from 'react';

export const isWidthDesktopSize = (width: number) => width > 992;

export const useIsDesktop = (): boolean => {
  const [width, setWidth] = useState<number>(window.innerWidth);

  const updateWindowDimensions = () => {
    setWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener('resize', updateWindowDimensions);
    return () => window.removeEventListener('resize', updateWindowDimensions);
  }, []);

  return isWidthDesktopSize(width);
};
