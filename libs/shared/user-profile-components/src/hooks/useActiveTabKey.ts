import { useCallback, useMemo, useState } from 'react';

export const PROFILE_TAB_KEYS = ['info', 'language'] as const;
export type ProfileTabKey = (typeof PROFILE_TAB_KEYS)[number];

export const useActiveTabKey = (): [
  ProfileTabKey,
  (value: ProfileTabKey) => void
] => {
  const searchParams = useMemo(
    () => new URLSearchParams(window.location.search),
    []
  );

  const [activeTabKey, setActiveTabKey] = useState<ProfileTabKey>(
    PROFILE_TAB_KEYS.includes(searchParams.get('tab') as ProfileTabKey)
      ? (searchParams.get('tab') as ProfileTabKey)
      : 'info'
  );

  const setActiveTabKeyExtended = useCallback(
    (value: ProfileTabKey) => {
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
