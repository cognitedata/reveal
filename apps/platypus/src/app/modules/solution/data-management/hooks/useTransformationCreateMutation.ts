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
  space: string;
  oneToManyFieldName?: string;
  transformationName: string;
  transformationExternalId: string;
  typeName: string;
  version: string;
  destination: 'data_model_instances' | 'instances';
};

export default function useTransformationCreateMutation() {
  const { track } = useMixpanel();
  const queryClient = useQueryClient();
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  const errorLogger = useErrorLogger();

  return useMutation<
    DataModelTransformation,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    TransformationCreateMutationDTO
  >(
    async ({
      space,
      oneToManyFieldName,
      transformationName,
      transformationExternalId,
      typeName,
      version,
      destination,
    }: TransformationCreateMutationDTO) => {
      const modelExternalId = oneToManyFieldName
        ? getOneToManyModelName(typeName, oneToManyFieldName, version)
        : getVersionedExternalId(typeName, version);

      const createTransformationDTO: CreateDataModelTransformationDTO = {
        destination:
          destination === 'data_model_instances'
            ? {
                instanceSpaceExternalId: space,
                modelExternalId,
                spaceExternalId: space,
                type: 'data_model_instances',
              }
            : {
                viewSpaceExternalId: space,
                viewExternalId: typeName,
                viewVersion: version,
                instanceSpaceExternalId: space,
                type: 'instances',
              },
        externalId: transformationExternalId,
        name: transformationName,
      };

      return dataManagementHandler.createTransformation(
        createTransformationDTO
      );
    },
    {
      onSuccess: (transformation, { space, typeName, version }) => {
        const queryKey = QueryKeys.TRANSFORMATION(space, typeName, version);

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
          space,
          typeName,
          version,
        });
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        errorLogger.log(error);
        Notification({ type: 'error', message: error.message });
      },
    }
  );
}
