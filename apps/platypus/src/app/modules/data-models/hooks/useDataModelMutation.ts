import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { PlatypusError } from '@platypus-app/types';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import {
  CreateDataModelDTO,
  DataModel,
  Result,
  UpdateDataModelDTO,
} from '@platypus/platypus-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDataModelMutation() {
  const queryClient = useQueryClient();
  const dataModelsHandler = useInjection(TOKENS.dataModelsHandler);

  return {
    create: useMutation<Result<DataModel>, PlatypusError, CreateDataModelDTO>(
      (dto) => {
        return dataModelsHandler.create(dto);
      },
      {
        onSuccess: (result) => {
          if (result.isFailure) {
            return;
          }

          const dataModel = result.getValue();

          // update cached list
          queryClient.cancelQueries(QueryKeys.DATA_MODEL_LIST);
          queryClient.setQueryData<DataModel[]>(
            QueryKeys.DATA_MODEL_LIST,
            (dataModels = []) => {
              return [dataModel, ...dataModels];
            }
          );
          queryClient.refetchQueries(QueryKeys.DATA_MODEL_LIST);

          // add data model to detail cache
          queryClient.cancelQueries(QueryKeys.DATA_MODEL(dataModel.id));
          queryClient.setQueryData<DataModel>(
            QueryKeys.DATA_MODEL(dataModel.id),
            dataModel
          );
        },
      }
    ),
    update: useMutation<Result<DataModel>, PlatypusError, UpdateDataModelDTO>(
      (dto) => {
        return dataModelsHandler.update(dto);
      },
      {
        onSuccess: (result) => {
          const dataModel = result.getValue();

          // update cached data model detail
          queryClient.cancelQueries(QueryKeys.DATA_MODEL(dataModel.id));
          queryClient.setQueryData<DataModel>(
            QueryKeys.DATA_MODEL(dataModel.id),
            dataModel
          );

          // reset list query
          queryClient.resetQueries(QueryKeys.DATA_MODEL_LIST);
        },
      }
    ),
  };
}
