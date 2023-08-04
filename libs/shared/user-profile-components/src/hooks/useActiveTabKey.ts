import { useCallback, useMemo, useState } from 'react';

export const useActiveTabKey = (
  keys: string[]
): [string, (value: string) => void] => {
  const searchParams = useMemo(
    () => new URLSearchParams(window.location.search),
    []
  );

  const [activeTabKey, setActiveTabKey] = useState<string>(
    keys.includes(searchParams.get('tab') as string)
      ? (searchParams.get('tab') as string)
      : 'info'
  );

  const setActiveTabKeyExtended = useCallback(
    (value: string) => {
      setActiveTabKey(value);
      searchParams.set('tab', value);
      const newUrl = new URL(window.location.href);
      newUrl.search = searchParams.toString();
      window.history.pushState(
        { path: newUrl.toString() },
        '',
        newUrl.toString()
      );
    },
    [setActiveTabKey, searchParams]
  );

  return [activeTabKey, setActiveTabKeyExtended];
};
