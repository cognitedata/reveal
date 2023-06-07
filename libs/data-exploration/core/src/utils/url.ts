// TODO(CDFUX-0): copies from @cognite/cdf-utilities!
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import isUrl from 'is-url';
import queryString from 'query-string';

type UseSearchParamOpts<T> = {
  replace?: boolean;
  deserialize: (val: string | null) => T | null;
  serialize: (val: T | null) => string | null;
};
export const useSearchParam = <T>(
  key: string,
  opts: UseSearchParamOpts<T>
): [T | null, (v: T | null) => void] => {
  const { replace = false, serialize, deserialize } = opts;
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(
    () => new URLSearchParams(searchParams),
    [searchParams]
  );
  const param = useMemo(() => {
    const val = params.get(key);
    if (val) {
      return deserialize(val);
    } else {
      return null;
    }
  }, [deserialize, key, params]);

  const updateParam = useCallback(
    (value: T | null) => {
      const val = serialize(value);
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
      setSearchParams(params.toString(), { replace });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, params, replace, serialize]
  );

  return [param, updateParam];
};
export const useSearchParamString = (
  key: string,
  opts?: { replace?: boolean }
) => {
  return useSearchParam<string>(key, {
    replace: opts?.replace,
    serialize: (s) => s,
    deserialize: (s) => s,
  });
};

export const isValidUrl = (value: string) => {
  return isUrl(value);
};

// Parsed object is not stringified back correctly when `opts` is given as `arrayFormat: 'comma'`,
// so be very careful while using with `opts` here!
export const getSearchParams = (
  searchParams: string,
  opts?: queryString.StringifyOptions
) => {
  return queryString.parse(searchParams, opts);
};
