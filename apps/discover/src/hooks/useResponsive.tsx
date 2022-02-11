import * as React from 'react';

export const useResponsive = () => {
  const [screenWidth, setScreenWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', updateScreenWidth);
    return () => window.removeEventListener('resize', updateScreenWidth);
  }, []);

  const screenSize = React.useMemo(() => {
    if (screenWidth <= 1920) return 'MEDIUM';
    return 'LARGE';
  }, [screenWidth]);

  const Modal = React.useMemo(() => {
    return {
      LARGE: {
        FULL_WIDTH: screenWidth,
        HALF_WIDTH: screenWidth * 0.5,
        THIRD_WIDTH: screenWidth * 0.3,
      },
      MEDIUM: {
        FULL_WIDTH: screenWidth * 0.9,
        HALF_WIDTH: screenWidth * 0.5,
        THIRD_WIDTH: screenWidth * (1 / 3), // 0.333333333333333333333333333...
        FOURTH_WIDTH: screenWidth * 0.25,
      },
    }[screenSize];
  }, [screenWidth]);

  const ResultPanel = React.useMemo(() => {
    return {
      LARGE: {
        MIN_SIZE: 400,
        MAX_SIZE: screenWidth - 412,
      },
      MEDIUM: {
        MIN_SIZE: 400,
        MAX_SIZE: screenWidth - 412,
      },
    }[screenSize];
  }, [screenWidth]);

  const Inspect = React.useMemo(() => {
    return {
      LARGE: {
        MIN_SIZE: 740,
        MAX_SIZE: screenWidth - 412,
      },
      MEDIUM: {
        MIN_SIZE: 740,
        MAX_SIZE: screenWidth - 412,
      },
    }[screenSize];
  }, [screenWidth]);

  return {
    ResultPanel,
    Inspect,
    Modal,
  };
};
