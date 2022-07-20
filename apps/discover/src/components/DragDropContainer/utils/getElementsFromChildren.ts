import React from 'react';

export const getElementsFromChildren = (children: React.ReactNode) => {
  const elements = React.Children.map(children, (element) =>
    React.cloneElement(element as JSX.Element)
  );
  return elements || [];
};
