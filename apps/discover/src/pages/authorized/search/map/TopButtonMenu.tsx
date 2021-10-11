import React from 'react';

import { TopButtonMenuContainer } from './elements';

interface Props {
  children: React.ReactElement[];
}

export const TopButtonMenu: React.FC<Props> = ({ children }) => {
  const containerRef = React.useRef<HTMLElement>(null);

  // When the page unloads, disconnect the IntersectionObserver
  React.useEffect(() => {
    // List all the HTML elements in the container
    const childrenArray = containerRef.current
      ? Array.from(containerRef?.current?.children)
      : [];

    // As soon as a button is not completely visible because their container is
    // too small, hide it.
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio < 0.99) {
          entry.target.classList.add('isHidden');
        } else {
          entry.target.classList.remove('isHidden');
        }
      });
    });

    childrenArray.forEach((child) => io.observe(child));

    return () => {
      io.disconnect();
    };
  });

  return (
    <TopButtonMenuContainer ref={containerRef}>
      {children}
    </TopButtonMenuContainer>
  );
};
