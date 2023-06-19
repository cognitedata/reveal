import React, { useEffect, useState } from 'react';

export function useResizeHandler(ref: React.RefObject<any>) {
  const [height, setTreeViewHeight] = useState(0);
  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        setTreeViewHeight(ref.current.getBoundingClientRect().height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [ref]);

  return { height };
}
