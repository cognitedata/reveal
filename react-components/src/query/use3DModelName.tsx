/*!
 * Copyright 2023 Cognite AS
 */

import { type QueryFunction, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useSDK } from '../components/RevealCanvas/SDKProvider';

export const use3DModelName = (ids: number[]): UseQueryResult<string[] | undefined, unknown> => {
  const sdk = useSDK();

  const queryFunction: QueryFunction<string[] | undefined> = async () => {
    const modelNamePromises = await Promise.allSettled(
      ids.map(async (id) => {
        const model = await sdk.models3D.retrieve(id);
        return model.name;
      })
    );

    const modelResolvedNames: string[] = [];
    modelNamePromises.forEach((modelNamePromise) => {
      if (modelNamePromise.status === 'fulfilled') {
        modelResolvedNames.push(modelNamePromise.value);
      } else if (modelNamePromise.status === 'rejected') {
        console.error('Error while retriving Model Name', modelNamePromise.reason);
      }
    });

    return modelResolvedNames;
  };

  const queryResult = useQuery<string[] | undefined>({
    queryKey: ['cdf', '3d', 'model', ids],
    queryFn: queryFunction,
    staleTime: Infinity
  });

  return queryResult;
};
