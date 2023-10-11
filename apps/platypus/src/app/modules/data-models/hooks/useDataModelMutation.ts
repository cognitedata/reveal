import {
  CreateDataModelDTO,
  DataModel,
  Result,
  UpdateDataModelDTO,
} from '@platypus/platypus-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TOKENS } from '../../../di';
import { useInjection } from '../../../hooks/useInjection';
import { PlatypusError } from '../../../types';
import { QueryKeys } from '../../../utils/queryKeys';

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
          queryClient.cancelQueries(
            QueryKeys.DATA_MODEL(dataModel.space, dataModel.id)
          );
          queryClient.setQueryData<DataModel>(
            QueryKeys.DATA_MODEL(dataModel.space, dataModel.id),
            dataModel
          );

          // invalidate space (in case a space was created)
          queryClient.invalidateQueries(QueryKeys.SPACES_LIST);
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
          queryClient.cancelQueries(
            QueryKeys.DATA_MODEL(dataModel.space, dataModel.id)
          );
          queryClient.setQueryData<DataModel>(
            QueryKeys.DATA_MODEL(dataModel.space, dataModel.id),
            dataModel
          );

          // reset list query
          queryClient.resetQueries(QueryKeys.DATA_MODEL_LIST);
        },
      }
    ),
  };
}
