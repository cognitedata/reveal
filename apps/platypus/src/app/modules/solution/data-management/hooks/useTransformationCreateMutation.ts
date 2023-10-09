import {
  getOneToManyModelName,
  getVersionedExternalId,
  DataModelTransformation,
  CreateDataModelTransformationDTO,
} from '@platypus/platypus-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Notification } from '../../../../components/Notification/Notification';
import { TOKENS } from '../../../../di';
import { useErrorLogger } from '../../../../hooks/useErrorLogger';
import { useInjection } from '../../../../hooks/useInjection';
import { useMixpanel } from '../../../../hooks/useMixpanel';
import { QueryKeys } from '../../../../utils/queryKeys';

type TransformationCreateMutationDTO = {
  space: string;
  oneToManyFieldName?: string;
  transformationName: string;
  transformationExternalId: string;
  typeName: string;
  version: string;
  dataSetId?: number;
  destination: 'data_model_instances' | 'nodes' | 'edges';
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
      dataSetId,
    }: TransformationCreateMutationDTO) => {
      const modelExternalId = oneToManyFieldName
        ? getOneToManyModelName(typeName, oneToManyFieldName, version)
        : getVersionedExternalId(typeName, version);

      const getDestination =
        (): CreateDataModelTransformationDTO['destination'] => {
          switch (destination) {
            case 'data_model_instances':
              return {
                instanceSpaceExternalId: space,
                modelExternalId,
                spaceExternalId: space,
                type: 'data_model_instances',
              };
            case 'nodes':
              return {
                view: { space, externalId: typeName, version: version },
                instanceSpace: space,
                type: 'nodes',
              };
            case 'edges':
              return {
                edgeType: {
                  space,
                  externalId: `${typeName}.${oneToManyFieldName}`,
                },
                instanceSpace: space,
                type: 'edges',
              };
          }
        };

      const createTransformationDTO: CreateDataModelTransformationDTO = {
        destination: getDestination(),
        externalId: transformationExternalId,
        name: transformationName,
        dataSetId,
      };

      return dataManagementHandler.createTransformation(
        createTransformationDTO
      );
    },
    {
      onSuccess: (
        transformation,
        { space, typeName, version, oneToManyFieldName }
      ) => {
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

        track('DataModel.Transformations.Create', {
          typeName,
          property: oneToManyFieldName,
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
