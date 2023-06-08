import { useMutation } from 'react-query';
import { ScheduledCalculationTask } from 'domain/scheduled-calculation/service/types';
import { toast } from '@cognite/cogs.js';
import { makeDefaultTranslations } from 'utils/translations';
import { useTimeseriesDeleteMutate } from '../../service/queries/useTimeseriesDeleteMutate';
import { useScheduledCalculationTaskDeleteMutate } from '../../service/queries/useScheduledCalculationTaskDeleteMutate';

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
        { externalId: scheduledCalculationResult?.externalId! },
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
