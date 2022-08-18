import * as React from 'react';

type Props = {
  onKeyDown: (event: KeyboardEvent) => void;
  key?: string;
  deps?: unknown[];
};

export const useKeyPressListener = ({ onKeyDown, key, deps = [] }: Props) => {
  React.useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (!key || key === event.key) {
        onKeyDown(event);
      }
    };
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, deps);
};
