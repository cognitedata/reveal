import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { PlatypusError } from '@platypus-app/types';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { CreateDataModelDTO, DataModel, Result } from '@platypus/platypus-core';
import { useMutation, useQueryClient } from 'react-query';

export function useDataModelCreateMutation() {
  const queryClient = useQueryClient();
  const dataModelsHandler = useInjection(TOKENS.dataModelsHandler);

  return useMutation<Result<DataModel>, PlatypusError, CreateDataModelDTO>(
    (dto) => {
      return dataModelsHandler.create({
        name: dto.name.trim(),
        description: dto.description,
      });
    },
    {
      onSuccess: (result) => {
        queryClient.cancelQueries(QueryKeys.DATA_MODEL_LIST);

        queryClient.setQueryData<DataModel[]>(
          QueryKeys.DATA_MODEL_LIST,
          (dataModels) => {
            if (!dataModels) {
              return [result.getValue()];
            }

            const updatedDataModels = [result.getValue(), ...dataModels];
            return updatedDataModels;
          }
        );

        queryClient.refetchQueries(QueryKeys.DATA_MODEL_LIST);
      },
    }
  );
}
