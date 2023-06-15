import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { BASE_QUERY_KEY } from '@transformations/common';
import { Notification, SdkListData } from '@transformations/types';
import { getTransformationsApiUrl } from '@transformations/utils';

import { useSDK } from '@cognite/sdk-provider';

export const getTransformationNotificationsQueryKey = (
  transformationId: number
) => [BASE_QUERY_KEY, 'transformation', 'notifications', transformationId];

export const useTransformationNotifications = (
  transformationId: number,
  options?: UseQueryOptions<
    SdkListData<Notification>,
    unknown,
    SdkListData<Notification>,
    (string | number)[]
  >
) => {
  const sdk = useSDK();

  return useQuery(
    getTransformationNotificationsQueryKey(transformationId),
    () =>
      sdk
        .get(getTransformationsApiUrl('/notifications'), {
          params: {
            transformationId,
          },
        })
        .then(({ data }) => data),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  const sdk = useSDK();

  return useMutation(
    (notification: Pick<Notification, 'transformationId' | 'destination'>) =>
      sdk.post(getTransformationsApiUrl('/notifications'), {
        data: {
          items: [notification],
        },
      }),
    {
      onSuccess: (_, notification) => {
        queryClient.invalidateQueries(
          getTransformationNotificationsQueryKey(notification.transformationId)
        );
      },
    }
  );
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const sdk = useSDK();

  return useMutation(
    ({ id }: Pick<Notification, 'transformationId' | 'id'>) =>
      sdk.post(getTransformationsApiUrl('/notifications/delete'), {
        data: {
          items: [{ id }],
        },
      }),
    {
      onSuccess: (_, { transformationId }) => {
        queryClient.invalidateQueries(
          getTransformationNotificationsQueryKey(transformationId)
        );
      },
    }
  );
};
