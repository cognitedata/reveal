import { useEffect, useState } from 'react';

export type APIState<T> = {
  isLoading: boolean;
  data: T;
  error?: any;
};

export const useFetch = <T>(
  promiseFn: () => T | Promise<T>,
  initialData: T,
  deps: any[] = []
) => {
  const [state, setState] = useState<APIState<T>>({
    isLoading: true,
    data: initialData,
  });

  useEffect(() => {
    (async () => {
      setState((prevState) => ({
        ...prevState,
        isLoading: true,
      }));
      try {
        const response = await promiseFn();
        setState({
          isLoading: false,
          data: response,
        });
      } catch (error) {
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          error,
        }));
      }
    })();
  }, deps);

  return state;
};

export default useFetch;
