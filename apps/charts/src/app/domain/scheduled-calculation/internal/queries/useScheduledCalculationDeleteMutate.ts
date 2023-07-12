import { ScheduledCalculationTask } from '@charts-app/domain/scheduled-calculation/service/types';
import { makeDefaultTranslations } from '@charts-app/utils/translations';
import { useMutation } from '@tanstack/react-query';

import { toast } from '@cognite/cogs.js';

import { useScheduledCalculationTaskDeleteMutate } from '../../service/queries/useScheduledCalculationTaskDeleteMutate';
import { useTimeseriesDeleteMutate } from '../../service/queries/useTimeseriesDeleteMutate';

const defaultTranslations = makeDefaultTranslations(
  'Unable to delete scheduled calculation.',
  'Deleted scheduled calculation successfully.'
);

export const useScheduledCalculationDeleteMutate = () => {
  const { mutateAsync: deleteScheduledCalculationTask } =
    useScheduledCalculationTaskDeleteMutate();
  const { mutateAsync: deleteTimeseries } = useTimeseriesDeleteMutate();
  const t = { ...defaultTranslations };

  return useMutation(
    async ({
      scheduledCalculationResult,
      shouldDeleteTimeseries,
    }: {
      scheduledCalculationResult?: ScheduledCalculationTask;
      shouldDeleteTimeseries: boolean;
    }) => {
      await deleteScheduledCalculationTask([
        // @ts-ignore
        { externalId: scheduledCalculationResult?.externalId },
      ]);
      if (
        shouldDeleteTimeseries &&
        scheduledCalculationResult?.targetTimeseriesExternalId
      ) {
        await deleteTimeseries([
          {
            externalId: scheduledCalculationResult?.targetTimeseriesExternalId,
          },
        ]);
      }
    },
    {
      onSuccess: () => {
        toast.success(t['Deleted scheduled calculation successfully.']);
      },
      onError: () => {
        toast.error(t['Unable to delete scheduled calculation.']);
      },
    }
  );
};
