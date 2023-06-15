import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { BASE_QUERY_KEY } from '@transformations/common';
import { getTransformationListQueryKey } from '@transformations/hooks';
import { Schedule } from '@transformations/types';
import { getTransformationsApiUrl } from '@transformations/utils';

import { useSDK } from '@cognite/sdk-provider';

import { getTransformationKey } from './transformation';

type ScheduleData = {
  items: Schedule[];
};

export const getScheduleQueryKey = (transformationId?: number) => [
  BASE_QUERY_KEY,
  'schedule',
  ...(transformationId !== undefined ? [transformationId] : []),
];

export const useSchedule = (
  transformationId?: number,
  options?: UseQueryOptions<
    Schedule | undefined,
    unknown,
    Schedule | undefined,
    (string | number)[]
  >
) => {
  const sdk = useSDK();

  return useQuery<
    Schedule | undefined,
    unknown,
    Schedule | undefined,
    (string | number)[]
  >(
    getScheduleQueryKey(transformationId),
    () => {
      if (transformationId === undefined) {
        return undefined;
      }

      return sdk
        .post<ScheduleData>(getTransformationsApiUrl('/schedules/byids'), {
          data: {
            items: [{ id: transformationId }],
          },
        })
        .then(({ data }) => {
          return data?.items?.[0];
        });
    },
    options
  );
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  const sdk = useSDK();

  return useMutation(
    ({
      schedules,
    }: {
      schedules: Pick<Schedule, 'id' | 'interval' | 'isPaused'>[];
    }) =>
      sdk.post(getTransformationsApiUrl('/schedules'), {
        data: {
          items: schedules,
        },
      }),
    {
      onSuccess: (_, { schedules }) => {
        const transformationId = schedules.map((schedule) => schedule.id);
        queryClient.invalidateQueries(getTransformationListQueryKey());
        if (transformationId.length === 1) {
          queryClient.invalidateQueries(
            getTransformationKey(transformationId[0])
          );
          queryClient.invalidateQueries(
            getScheduleQueryKey(transformationId[0])
          );
        }
      },
    }
  );
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  const sdk = useSDK();

  return useMutation(
    ({ transformationId }: { transformationId: number }) =>
      sdk.post(getTransformationsApiUrl('/schedules/delete'), {
        data: {
          items: [{ id: transformationId }],
        },
      }),
    {
      onSuccess: (_, { transformationId }) => {
        queryClient.invalidateQueries(getTransformationListQueryKey());
        queryClient.invalidateQueries(getTransformationKey(transformationId));
        queryClient.invalidateQueries(getScheduleQueryKey(transformationId));
      },
    }
  );
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  const sdk = useSDK();

  return useMutation(
    ({
      schedules,
    }: {
      schedules: (Required<Pick<Schedule, 'id'>> &
        Partial<Pick<Schedule, 'interval' | 'isPaused'>>)[];
    }) =>
      sdk.post(getTransformationsApiUrl('/schedules/update'), {
        data: {
          items: schedules.map((schedule) => ({
            id: schedule.id,
            update: {
              ...(schedule.interval !== undefined
                ? {
                    interval: {
                      set: schedule.interval,
                    },
                  }
                : {}),
              ...(schedule.isPaused !== undefined
                ? {
                    isPaused: {
                      set: schedule.isPaused,
                    },
                  }
                : {}),
            },
          })),
        },
      }),
    {
      onSuccess: (_, { schedules }) => {
        const transformationId = schedules.map((schedule) => schedule.id);

        queryClient.invalidateQueries(getTransformationListQueryKey());
        if (transformationId.length === 1) {
          queryClient.invalidateQueries(
            getTransformationKey(transformationId[0])
          );
          queryClient.invalidateQueries(
            getScheduleQueryKey(transformationId[0])
          );
        }
      },
    }
  );
};

type ScheduleTransformationData = {
  externalId: string;
  interval: string;
  isPaused: boolean;
};

// TODO: we might not need this, or handle it differently
export const useScheduleTransformation = () => {
  const queryClient = useQueryClient();
  const sdk = useSDK();

  return useMutation(
    async (items: ScheduleTransformationData[] = []) => {
      return await sdk.post(getTransformationsApiUrl('/schedules'), {
        data: {
          items,
        },
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(getTransformationListQueryKey());
      },
    }
  );
};
