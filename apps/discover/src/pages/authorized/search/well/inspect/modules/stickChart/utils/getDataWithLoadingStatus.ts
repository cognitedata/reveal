import { DataWithLoadingStatus } from '../types';

type ColumnsDataHookReturnType<T> = {
  data: Record<string, T>;
  isLoading: boolean;
};

export const getDataWithLoadingStatus = <T>(
  columnsDataHookResult: ColumnsDataHookReturnType<T>,
  wellboreMatchingId: string
): DataWithLoadingStatus<T> => {
  const { data, isLoading } = columnsDataHookResult;

  return {
    data: data[wellboreMatchingId],
    isLoading,
  };
};
