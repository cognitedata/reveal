// https://stackoverflow.com/a/75101934/218198
import { RefObject, useMemo, useSyncExternalStore } from 'react';

function subscribe(callback: (e: Event) => void) {
  window.addEventListener('resize', callback);
  return () => {
    window.removeEventListener('resize', callback);
  };
}

export function useDimensions(ref: RefObject<HTMLElement>) {
  const dimensions = useSyncExternalStore(subscribe, () =>
    JSON.stringify({
      width: ref.current?.offsetWidth ?? 0,
      height: ref.current?.offsetHeight ?? 0,
    })
  );
  return useMemo(() => JSON.parse(dimensions), [dimensions]);
}
