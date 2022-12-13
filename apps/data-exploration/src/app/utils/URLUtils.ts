// TODO(CDFUX-0): copies from @cognite/cdf-utilities!
import queryString from 'query-string';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export const getProject = () =>
  new URL(window.location.href).pathname.split('/')[1];

export const getEnv = () => {
  const param = queryString.parse(window.location.search).env;
  if (param instanceof Array) {
    return param[0];
  }
  if (typeof param === 'string') {
    return param;
  }
  return undefined;
};

export const checkUrl = (env: string) => window.location.hostname.includes(env);
export const isDevelopment = () => checkUrl('dev') || checkUrl('localhost');
export const isStaging = () => checkUrl('staging') || checkUrl('pr');
export const isProduction = () => !(isStaging() || isDevelopment());

export const getEnvironment = () => {
  if (isDevelopment()) {
    return 'development';
  }
  if (isStaging()) {
    return 'staging';
  }
  return 'production';
};

export const createLink = (
  path: string,
  queries: any = {},
  opts?: queryString.StringifyOptions
): string => {
  const project = getProject() || '';
  const env = getEnv();
  const query = queryString.stringify({ ...queries, env }, opts);
  if (query.length > 0) {
    return `/${project}${path}?${query}`;
  }
  if (path.length > 0 && path !== '/') {
    return `/${project}${path}`;
  }
  return `/${project}`;
};

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

export const useSearchParamNumber = (
  key: string,
  opts?: { replace?: boolean }
) => {
  return useSearchParam<number>(key, {
    replace: opts?.replace,
    serialize: (n) => {
      if (!Number.isFinite(n)) {
        return null;
      }
      return `${n}`;
    },
    deserialize: (s) => {
      if (!s) {
        return null;
      }
      try {
        return parseInt(s, 10);
      } catch {
        return null;
      }
    },
  });
};

export const removeProjectFromPath = (path: string) => {
  return `/${path.split('/').slice(2).join('/')}`;
};
