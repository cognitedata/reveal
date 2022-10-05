import { useCallback, useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

export const useSearchParamState = <ValueType>(
  key: string
): [ValueType | undefined, (nextState?: ValueType) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const param = searchParams.get(key);
  const searchParamState: ValueType | undefined = useMemo(() => {
    let state: ValueType | undefined;
    try {
      state = JSON.parse(param ?? '');
    } catch {
      state = undefined;
    }
    return state;
  }, [param]);

  const setSearchParamsState = useCallback(
    (nextState?: ValueType) => {
      const updatedSearchParams = new URLSearchParams(searchParams);
      if (!nextState) {
        updatedSearchParams.delete(key);
      } else {
        let stringifiedState: string;
        try {
          stringifiedState = JSON.stringify(nextState);
        } catch {
          stringifiedState = '';
        }

        updatedSearchParams.set(key, stringifiedState);
      }
      setSearchParams(updatedSearchParams, { replace: true });
    },
    [key, searchParams, setSearchParams]
  );

  return [searchParamState, setSearchParamsState];
};
