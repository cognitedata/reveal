import { useEffect, useState } from 'react';

const useElementDescendantFocus = (
  containerRef: React.MutableRefObject<HTMLDivElement | null>
) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocusIn = () => {
    setIsFocused(true);
  };

  const handleFocusOut = () => {
    setIsFocused(false);
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.addEventListener('focusin', handleFocusIn);
      containerRef.current.addEventListener('focusout', handleFocusOut);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('focusin', handleFocusIn);
        containerRef.current.removeEventListener('focusout', handleFocusOut);
      }
    };
  }, [containerRef]);

  return { isFocused };
};

export default useElementDescendantFocus;
