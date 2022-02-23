import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import useDebounce from 'hooks/useDebounce';

interface Size {
  width: number;
  height: number;
}

function useElementSize<T extends HTMLElement = HTMLDivElement>(): [
  (node: T | null) => void,
  Size
] {
  // Mutable values like 'ref.current' aren't valid dependencies
  // because mutating them doesn't re-render the component.
  // Instead, we use a state as a ref to be reactive.
  const [ref, setRef] = useState<T | null>(null);
  const [size, setSize] = useState<Size>({
    width: 0,
    height: 0,
  });
  const debouncedSize = useDebounce(size, 250);

  // Prevent too many rendering using useCallback
  const handleSize = useCallback(() => {
    setSize({
      width: ref?.offsetWidth || 0,
      height: ref?.offsetHeight || 0,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref?.offsetHeight, ref?.offsetWidth]);

  useEffect(() => {
    window.addEventListener('resize', handleSize);

    return () => {
      window.removeEventListener('resize', handleSize);
    };
  }, []);

  useEffect(() => {
    document.addEventListener('CSP:TabChange', handleSize);

    return () => {
      document.removeEventListener('CSP:TabChange', handleSize);
    };
  }, []);

  useLayoutEffect(() => {
    handleSize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref?.offsetHeight, ref?.offsetWidth]);

  return [setRef, debouncedSize];
}

export default useElementSize;
