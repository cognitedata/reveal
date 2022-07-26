import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { TOKENS } from '@platypus-app/di';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { useErrorLogger } from '@platypus-app/hooks/useErrorLogger';

const GET_KEY = (type: string, externalId: string) => [
  'getTransformation',
  `${type}_${externalId}`,
];

export function useTransformation(
  type: string,
  externalId: string,
  isEnabled: boolean
) {
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  const query = useQuery(
    GET_KEY(type, externalId),
    async () => {
      return dataManagementHandler.getTransformations(type, externalId);
    },
    {
      enabled: !type.includes('undefined') && isEnabled,
    }
  );

  return query;
}

export function useTransformationMutate() {
  const queryClient = useQueryClient();
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  const errorLogger = useErrorLogger();

  return useMutation(
    async ({
      typeKey,
      externalId,
    }: {
      typeKey: string;
      externalId: string;
    }) => {
      const data = {
        externalId: `t_${externalId}_${typeKey}`,
        name: typeKey,
        destination: {
          type: 'alpha_data_model_instances',
          instanceSpaceExternalId: externalId,
          spaceExternalId: externalId,
          modelExternalId: typeKey,
        },
      };

      return dataManagementHandler.createTransformation(data);
    },
    {
      onSuccess: (transformation) => {
        queryClient.invalidateQueries(
          GET_KEY(
            transformation.destination.modelExternalId,
            transformation.destination.spaceExternalId
          )
        );
      },
      onError: (error: any) => {
        errorLogger.log(error);
        Notification({ type: 'error', message: error.message });
      },
    }
  );
}
