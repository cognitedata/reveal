import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ComputationStep } from '@cognite/calculation-backend';
import { CogniteError, Timeseries } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { useCreateSessionNonce, SessionAPIResponse } from '../../../chart';
import { ScheduleCalculationFieldValues } from '../../internal/types';
import { createScheduledCalculation } from '../network/createScheduledCalculation';
import { ScheduledCalculationTask } from '../types';

import { useTimeseriesCreateMutate } from './useTimeseriesCreateMutate';

type MutateProps = {
  calculation: ScheduleCalculationFieldValues;
  workflowSteps: ComputationStep[];
};
const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;

const PERIOD_MULTIPLIER: Record<string, number> = {
  minutes: ONE_MINUTE,
  hours: ONE_HOUR,
  days: ONE_DAY,
};

export const useScheduledCalculationCreateMutate = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  const { mutateAsync: createNonce } = useCreateSessionNonce();
  const { mutateAsync: createTimeseries } = useTimeseriesCreateMutate();

  return useMutation<
    [Timeseries, ScheduledCalculationTask],
    CogniteError,
    MutateProps
  >(
    ({ calculation, workflowSteps }) => {
      const period =
        calculation.period * PERIOD_MULTIPLIER[calculation.periodType.value!];
      const adaptedNameForExternalId = calculation.name.replaceAll(' ', '_');
      const now = Date.now();

      return createTimeseries([
        {
          name: calculation.name,
          externalId: `${adaptedNameForExternalId}_${now}_TS`,
          unit: calculation.unit?.value,
          description: calculation.description,
          metadata: { _auto_generated_source_: '__scheduled_calculation__' },
          dataSetId: calculation.dataset?.id,
        },
      ])
        .catch(() => {
          throw new Error(
            'Could not create timeseries for scheduled calculation!'
          );
        })
        .then<[Timeseries, SessionAPIResponse]>(async ([timeseries]) => {
          try {
            let nonceResponse;
            if (calculation.cdfCredsMode === 'USER_CREDS') {
              nonceResponse = await createNonce({
                items: [{ tokenExchange: true }],
              });
            } else {
              nonceResponse = await createNonce({
                items: [
                  {
                    clientId: calculation.clientId,
                    clientSecret: calculation.clientSecret,
                  },
                ],
              });
            }
            return [timeseries, nonceResponse];
          } catch {
            throw new Error('Could not create nonce from credentials!');
          }
        })
        .then(async ([timeseries, nonceResponse]) => {
          try {
            const scheduledCalculation = await createScheduledCalculation(
              {
                items: [
                  {
                    name: calculation.name,
                    externalId: `${adaptedNameForExternalId}_${now}`,
                    description: calculation.description,
                    targetTimeseriesExternalId: timeseries.externalId!,
                    period,
                    nonce: nonceResponse.items[0].nonce,
                    graph: {
                      granularity: `${calculation.period}${calculation.periodType.value?.[0]}`,
                      steps: workflowSteps.map(
                        ({ op, inputs, version, step, params }) => ({
                          op,
                          inputs,
                          version,
                          step,
                          params,
                          raw: true,
                        })
                      ),
                    },
                  },
                ],
              },
              sdk
            );
            // need to use timeseries to set unit in scheduledCalculationCollection item
            return [timeseries, scheduledCalculation?.data?.items?.[0]];
          } catch {
            throw new Error('Could not create scheduled calculation.');
          }
        });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['scheduled-calculations']);
      },
    }
  );
};
