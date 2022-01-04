import { useEffect, useState } from 'react';
import { useAuthContext } from '@cognite/react-container';
import { CogniteClient } from '@cognite/sdk';

const initialState = {
  data: undefined,
  loading: true,
  error: undefined,
};

export const useScannerData = <T>(
  func: (client: CogniteClient, ...props: any) => Promise<T>,
  ...props: any
) => {
  const { client } = useAuthContext();
  const [state, setState] =
    useState<{ data: T | undefined; loading: boolean; error: any }>(
      initialState
    );

  useEffect(() => {
    if (client) {
      setState((state) => ({ ...state, loading: true }));

      func(client, ...props)
        .then((data) => {
          setState((state) => ({ ...state, data, loading: false }));
        })
        .catch((error) => {
          setState((state) => ({ ...state, error, loading: false }));
        });
    }
  }, [client, props]);

  return state;
};
