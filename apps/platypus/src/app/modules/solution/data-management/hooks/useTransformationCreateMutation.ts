import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { TOKENS } from '@platypus-app/di';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { useErrorLogger } from '@platypus-app/hooks/useErrorLogger';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { useMixpanel } from '@platypus-app/hooks/useMixpanel';

import {
  getOneToManyModelName,
  getVersionedExternalId,
  DataModelTransformation,
  CreateDataModelTransformationDTO,
} from '@platypus/platypus-core';

type TransformationCreateMutationDTO = {
  dataModelExternalId: string;
  oneToManyFieldName?: string;
  transformationName: string;
  transformationExternalId: string;
  typeName: string;
  version: string;
};

export default function useTransformationCreateMutation() {
  const { track } = useMixpanel();
  const queryClient = useQueryClient();
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  const errorLogger = useErrorLogger();

  return useMutation<
    DataModelTransformation,
    any,
    TransformationCreateMutationDTO
  >(
    async ({
      dataModelExternalId,
      oneToManyFieldName,
      transformationName,
      transformationExternalId,
      typeName,
      version,
    }: TransformationCreateMutationDTO) => {
      const modelExternalId = oneToManyFieldName
        ? getOneToManyModelName(typeName, oneToManyFieldName, version)
        : getVersionedExternalId(typeName, version);

      const createTransformationDTO: CreateDataModelTransformationDTO = {
        destination: {
          instanceSpaceExternalId: dataModelExternalId,
          modelExternalId,
          spaceExternalId: dataModelExternalId,
          type: 'data_model_instances',
        },
        externalId: transformationExternalId,
        name: transformationName,
      };

      return dataManagementHandler.createTransformation(
        createTransformationDTO
      );
    },
    {
      onSuccess: (
        transformation,
        { dataModelExternalId, typeName, version }
      ) => {
        const queryKey = QueryKeys.TRANSFORMATION(
          dataModelExternalId,
          typeName,
          version
        );

        queryClient.cancelQueries(queryKey);
        queryClient.setQueryData<DataModelTransformation[]>(
          queryKey,
          (transformations) => {
            const existingTransformations = transformations || [];

            return [...existingTransformations, transformation];
          }
        );
        queryClient.refetchQueries(queryKey);

        track('Transformations', {
          dataModel: dataModelExternalId,
        });
      },
      onError: (error: any) => {
        errorLogger.log(error);
        Notification({ type: 'error', message: error.message });
      },
    }
  );
}
