import { useMemo } from 'react';

function useSimpleMemo<T>(value: T): T {
  const stringifyedValue = JSON.stringify(value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedValue = useMemo(() => value, [stringifyedValue]);
  return memoizedValue;
}

export default useSimpleMemo;
