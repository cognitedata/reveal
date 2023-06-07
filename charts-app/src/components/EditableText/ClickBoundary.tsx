import { ReactNode } from 'react';
import * as React from 'react';

interface ClickBoundaryProps {
  children: ReactNode;
}

const stopPropagation = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  e.stopPropagation();
  e.preventDefault();
};

const ClickBoundary = ({ children }: ClickBoundaryProps) => {
  /* eslint-disable
    jsx-a11y/click-events-have-key-events,
    jsx-a11y/no-static-element-interactions */
  return <div onClick={stopPropagation}>{children}</div>;
  /* eslint-enable
    jsx-a11y/click-events-have-key-events,
    jsx-a11y/no-static-element-interactions */
};

export default ClickBoundary;
