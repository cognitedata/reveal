import React from 'react';

import compact from 'lodash/compact';

export const getElementsFromChildren = (children: React.ReactNode) => {
  const elements = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child);
    }
    return child;
  });
  return (compact(elements) as JSX.Element[]) || [];
};
