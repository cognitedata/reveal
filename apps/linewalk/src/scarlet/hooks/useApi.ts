import { useEffect, useState } from 'react';
import { useAuthContext } from '@cognite/react-container';
import { CogniteClient } from '@cognite/sdk';
import { APIState } from 'scarlet/types';

const initialState = {
  data: undefined,
  loading: true,
  error: undefined,
};

export const useApi = <T>(
  func: (client: CogniteClient, props?: any) => Promise<T>,
  props?: any,
  options?: {
    data?: T;
    skip?: boolean;
  }
) => {
  const { client } = useAuthContext();
  const [state, setState] = useState<APIState<T>>({
    ...initialState,
    data: options?.data,
    loading: !options?.data,
  });

  useEffect(() => {
    if (client && !options?.data && !options?.skip) {
      setState((state) => (state.loading ? state : initialState));
      func(client, props)
        .then((data) => {
          setState((state) => ({ ...state, data, loading: false }));
        })
        .catch((error) => {
          setState((state) => ({ ...state, error, loading: false }));
        });
    }
  }, [client, JSON.stringify(props), options?.skip]);

  return state;
};
