import { DependencyList, useEffect } from 'react';

const useKeyboardShortcut = <T extends GlobalEventHandlers>(
  ref: T | null,
  code: string,
  fn: () => void,
  deps: DependencyList = []
) => {
  useEffect(() => {
    if (ref) {
      const handler = (event: KeyboardEvent) => {
        if (event.code === code) {
          fn();
        }
      };

      ref.addEventListener('keydown', handler);

      return () => {
        ref.removeEventListener('keydown', handler);
      };
    }

    return () => {
      return undefined;
    };
  }, deps);
};

export default useKeyboardShortcut;
