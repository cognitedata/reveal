import { useState, useEffect, useRef } from 'react';

export const useClickAwayListener = (initialIsVisible: boolean) => {
  const [isComponentVisible, setIsComponentVisible] = useState(
    initialIsVisible
  );
  const ref = useRef(null);

  const listener = (event: MouseEvent) => {
    if (ref.current && !(ref.current! as any).contains(event.target)) {
      setIsComponentVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', listener, true);
    return () => {
      document.removeEventListener('mousedown', listener, true);
    };
  });

  return { ref, isComponentVisible, setIsComponentVisible };
};
