import { useCallback, useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

export const useSearchParamState = <ValueType>(
  key: string
): ValueType | undefined => {
  const [searchParams] = useSearchParams();

  const param = searchParams.get(key);
  const parsedState: ValueType | undefined = useMemo(() => {
    let state: ValueType | undefined;
    try {
      state = JSON.parse(param ?? '');
    } catch {
      state = undefined;
    }
    return state;
  }, [param]);

  return parsedState;
};

export const useUpdateSearchParamState = <
  SearchParamState extends Record<string, any>
>(): {
  updateSearchParamState: (nextState: SearchParamState) => void;
} => {
  const [_, setSearchParams] = useSearchParams();

  const updateSearchParamState = useCallback(
    (nextState: SearchParamState) => {
      setSearchParams(
        (prevSearchParams) => {
          const updatedSearchParams = new URLSearchParams(prevSearchParams);
          Object.keys(nextState).forEach((key) => {
            const value = nextState[key];
            if (!value) {
              updatedSearchParams.delete(key);
            } else {
              let stringifiedState: string;
              try {
                stringifiedState = JSON.stringify(value);
              } catch {
                stringifiedState = '';
              }
              updatedSearchParams.set(key, stringifiedState);
            }
          });
          return updatedSearchParams;
        },
        {
          replace: true,
        }
      );
    },
    [setSearchParams]
  );

  return { updateSearchParamState };
};
