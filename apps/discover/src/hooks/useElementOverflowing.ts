import React from 'react';

import isNil from 'lodash/isNil';

const isElementOverflowing = (element: HTMLElement): boolean => {
  if (isNil(element)) {
    return false;
  }
  return element.offsetWidth < element.scrollWidth;
};

export const useElementOverflowing = (element?: HTMLElement | null) => {
  const [overflowing, setOverflowing] = React.useState(false);

  React.useLayoutEffect(() => {
    if (element) {
      const value = isElementOverflowing(element);
      setOverflowing(value);
    }
  }, [element]);

  return overflowing;
};
