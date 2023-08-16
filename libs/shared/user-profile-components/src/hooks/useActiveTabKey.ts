import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useActiveTabKey = (
  keys: string[]
): [string, (value: string) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTabKey = useMemo(() => {
    const tabKeyValue = searchParams.get('tab') ?? 'info';
    return keys.includes(tabKeyValue) ? tabKeyValue : 'info';
  }, [searchParams, keys]);

  const setActiveTabKey = useCallback(
    (tabKeyValue: string) => {
      setSearchParams(
        (prev) => {
          prev.set('tab', keys.includes(tabKeyValue) ? tabKeyValue : 'info');
          return prev;
        },
        { replace: true }
      );
    },
    [setSearchParams, keys]
  );

  return [activeTabKey, setActiveTabKey];
};
