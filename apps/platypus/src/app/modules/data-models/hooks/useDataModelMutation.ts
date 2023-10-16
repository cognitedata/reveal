import {
  CreateDataModelDTO,
  DataModel,
  UpdateDataModelDTO,
} from '@platypus/platypus-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TOKENS } from '../../../di';
import { useInjection } from '../../../hooks/useInjection';
import { PlatypusError } from '../../../types';
import { QueryKeys } from '../../../utils/queryKeys';

export function useDataModelMutation() {
  const queryClient = useQueryClient();
  const createDataModelCommand = useInjection(TOKENS.createDataModelCommand);
  const updateDataModelCommand = useInjection(TOKENS.updateDataModelCommand);

  return {
    create: useMutation<DataModel, PlatypusError, CreateDataModelDTO>(
      (dto) => {
        return createDataModelCommand.execute(dto);
      },
      {
        onSuccess: (dataModel) => {
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
    update: useMutation<DataModel, PlatypusError, UpdateDataModelDTO>(
      (dto) => {
        return updateDataModelCommand.execute(dto);
      },
      {
        onSuccess: (dataModel) => {
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
