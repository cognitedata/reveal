/*!
 * Copyright 2023 Cognite AS
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useSDK } from '../components/RevealContainer/SDKProvider';

export const use3DModelName = (ids: number[]): UseQueryResult<string[] | undefined, unknown> => {
  const sdk = useSDK();

  const queryResult = useQuery<string[] | undefined>(['cdf', '3d', 'model', ids], async () => {
    const modelNames: string[] = await Promise.all(
      ids.map(async (id) => {
        const model = await sdk.models3D.retrieve(id);
        return model.name;
      })
    );
    return modelNames;
  });

  return queryResult;
};
