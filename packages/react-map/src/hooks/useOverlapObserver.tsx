import * as React from 'react';

export const useOverlapObserver = () => {
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

  return containerRef;
};
