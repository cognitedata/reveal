import { TOKENS } from '@platypus-app/di';
import { DataModelTypeDefsType, FetchDataDTO } from '@platypus/platypus-core';
import { useInfiniteQuery, useQueryClient } from 'react-query';
import { useInjection } from '../../../../hooks/useInjection';
import { Notification } from '@platypus-app/components/Notification/Notification';

export function usePreviewPageData(
  dto: Omit<FetchDataDTO, 'cursor' | 'hasNextPage' | 'dataModelType'> & {
    dataModelType: DataModelTypeDefsType | null;
  },
  isEnabled = true
) {
  const queryKey = [
    'previewData',
    { id: dto.dataModelId, type: dto.dataModelType?.name },
  ];
  const queryClient = useQueryClient();
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  const updatePreviewData = (data: any, pageSize: number) => {
    const chunkedArray = chunkArrays(data, pageSize);
    queryClient.setQueriesData(queryKey, chunkedArray);
  };
  return {
    ...useInfiniteQuery(
      queryKey,
      async ({ pageParam = { cursor: '', hasNextPage: false } }) => {
        try {
          const result = await dataManagementHandler.fetchData({
            ...dto,
            dataModelType: dto.dataModelType!,
            cursor: pageParam.cursor,
            hasNextPage: pageParam.hasNextPage,
          });
          const fetchedData = result.getValue();
          return fetchedData;
        } catch (errResponse: any) {
          const error = errResponse.error;
          Notification({
            type: 'error',
            message: error.message,
            validationErrors: error.errors,
          });
          throw errResponse;
        }
      },
      {
        enabled: Boolean(isEnabled && dto.dataModelType?.name),
        getNextPageParam: (lastPage) =>
          lastPage.pageInfo.hasNextPage
            ? {
                cursor: lastPage.pageInfo.cursor,
                hasNextPage: lastPage.pageInfo.hasNextPage,
              }
            : undefined,
      }
    ),
    updatePreviewData,
  };
}

const chunkArrays = (array: any[], chunkSize: number) => {
  const myArr = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    myArr.push(array.slice(i, i + chunkSize));
  }
  return myArr;
};
