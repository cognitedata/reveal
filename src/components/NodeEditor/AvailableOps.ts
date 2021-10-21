import { useQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { fetchOperations } from 'services/calculation-backend';
import { Operation } from '@cognite/calculation-backend';
import { FunctionCallStatus } from 'hooks/cognite-functions';

export interface CallResponse {
  id: number;
  functionId: number;
  response: any;
  status: FunctionCallStatus;
}

export function useAvailableOps(): [boolean, Error?, Operation[]?] {
  const sdk = useSDK();

  const cacheOptions = {
    cacheTime: Infinity,
    staleTime: Infinity,
    retry: false,
  };

  const {
    data: response,
    isFetched,
    isError: responseError,
  } = useQuery({
    queryKey: ['available_operations'],
    queryFn: () => fetchOperations(sdk),
    ...cacheOptions,
  });

  if (responseError) {
    return [false, new Error('Could not get available operations'), undefined];
  }

  if (!isFetched) {
    return [true, undefined, undefined];
  }
  if (isFetched && response) {
    return [false, undefined, response];
  }
  return [false, new Error('Something went wrong'), undefined];
}
