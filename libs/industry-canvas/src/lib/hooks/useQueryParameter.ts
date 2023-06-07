import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type UseQueryStringProps = {
  key: string;
};

type UseQueryStringReturnType = {
  queryString: string;
  setQueryString: Dispatch<SetStateAction<string>>;
};

export const useQueryParameter = ({
  key,
}: UseQueryStringProps): UseQueryStringReturnType => {
  const [queryString, setQueryString] = useState<string>('');

  // Load the search string from the query params if it's not already set
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryParamValue = params.get(key);
    setQueryString(queryParamValue ?? '');
  }, [key]);

  // Update the query params when the search string changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (queryString !== '') {
      params.set(key, queryString);
    } else {
      params.delete(key);
    }
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${params.toString()}`
    );
  }, [queryString, key]);

  return { queryString, setQueryString };
};
