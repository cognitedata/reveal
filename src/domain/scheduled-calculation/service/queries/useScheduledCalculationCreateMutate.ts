import { useMutation } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import { useCreateSessionNonce, SessionAPIResponse } from 'domain/chart';
import { ComputationStep } from '@cognite/calculation-backend';
import { createScheduledCalculation } from '../network/createScheduledCalculation';
import { ScheduleCalculationFieldValues } from '../../internal/types';

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
  const { mutateAsync: createNonce } = useCreateSessionNonce();

  return useMutation(
    ({
      calculation,
      workflowSteps,
    }: {
      calculation: ScheduleCalculationFieldValues;
      workflowSteps: ComputationStep[];
    }) => {
      const period =
        calculation.period * PERIOD_MULTIPLIER[calculation.periodType.value!];
      return new Promise<SessionAPIResponse>((res, rej) => {
        if (calculation.cdfCredsMode === 'USER_CREDS') {
          return createNonce({
            items: [{ tokenExchange: true }],
          })
            .then(res)
            .catch(rej);
        }
        return createNonce({
          items: [
            {
              clientId: calculation.clientId,
              clientSecret: calculation.clientSecret,
            },
          ],
        })
          .then(res)
          .catch(rej);
      })
        .catch(() => {
          throw new Error('Could not create nonce from credentials!');
        })
        .then((nonceResponse) =>
          createScheduledCalculation(
            {
              items: [
                {
                  name: calculation.name,
                  externalId: `${calculation.name}_${Date.now()}`,
                  description: calculation.description,
                  targetTimeseriesExternalId: 'temporary_dummy_external_id',
                  period,
                  nonce: nonceResponse.items[0].nonce,
                  graph: {
                    granularity: `${calculation.period}${calculation.periodType.value?.[0]}`,
                    steps: workflowSteps.map(
                      ({ op, inputs, version, step }) => ({
                        op,
                        inputs,
                        version,
                        step,
                        raw: true,
                      })
                    ),
                  },
                },
              ],
            },
            sdk
          )
        );
    }
  );
};
