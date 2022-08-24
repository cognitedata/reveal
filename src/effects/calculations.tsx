import {
  Calculation,
  CalculationResultQueryAggregateEnum,
} from '@cognite/calculation-backend';
import { getStepsFromWorkflow } from 'components/NodeEditor/transforms';
import { isWorkflowRunnable } from 'components/NodeEditor/utils';
import { validateSteps } from 'components/NodeEditor/V2/calculations';
import dayjs from 'dayjs';
import {
  useCalculationQueryResult,
  useCalculationStatus,
  useCreateCalculation,
} from 'hooks/calculation-backend';
import { workflowsAtom } from 'models/calculation-results/atom';
import chartAtom from 'models/chart/atom';
import { ChartWorkflowV2 } from 'models/chart/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';
import { CHART_POINTS_PER_SERIES } from 'utils/constants';
import { getHash } from 'utils/hash';
import { calculateGranularity } from 'utils/timeseries';
import { useDebounce } from 'use-debounce';
import { updateWorkflow } from 'models/chart/updates';
import { isEqual } from 'lodash';
import { useOperations } from 'models/operations/atom';

export function CalculationCollectionEffects() {
  const [chart] = useRecoilState(chartAtom);

  const calculationEffectElements = chart?.workflowCollection?.map(
    (calculation) => (
      <CalculationEffects
        key={calculation.id}
        calculation={calculation as ChartWorkflowV2}
      />
    )
  );

  return <>{calculationEffectElements}</>;
}

function CalculationEffects({ calculation }: { calculation: ChartWorkflowV2 }) {
  const [, setWorkflowState] = useRecoilState(workflowsAtom);
  const { mutate: createCalculation, isLoading: isCallLoading } =
    useCreateCalculation();
  const [chart, mutate] = useRecoilState(chartAtom);
  const { id, enabled, calls } = calculation;
  const call = [...(calls || [])].sort((c) => c.callDate)[0];
  const [, , operations] = useOperations();
  const [refetchInterval, setRefetchInterval] = useState<number | false>(2000);

  const steps = useMemo(
    () =>
      isWorkflowRunnable(calculation)
        ? getStepsFromWorkflow(chart!, calculation, operations)
        : [],
    [chart, calculation, operations]
  ) as Calculation['steps'];

  const isStepsValid =
    calculation.version === 'v2' ? validateSteps(steps, operations) : true;

  const [{ dateFrom, dateTo }] = useDebounce(
    { dateFrom: chart!.dateFrom, dateTo: chart!.dateTo },
    2000,
    {
      equalityFn: isEqual,
    }
  );

  const computation: Calculation = useMemo(
    () => ({
      /**
       * Use raw data for all steps
       */
      steps: steps.map((step) => {
        return {
          ...step,
          raw: true,
        };
      }),
      start_time: new Date(dateFrom).getTime(),
      end_time: new Date(dateTo).getTime(),
      granularity: calculateGranularity(
        [new Date(dateFrom).getTime(), new Date(dateTo).getTime()],
        1000
      ),
    }),
    [steps, dateFrom, dateTo]
  );

  const stringifiedComputation = JSON.stringify(computation);

  const runComputation = useCallback(() => {
    if (!enabled) {
      return;
    }

    if (!isStepsValid) {
      mutate((oldChart) =>
        updateWorkflow(oldChart!, calculation.id, {
          calls: [],
        })
      );
      setWorkflowState((workflows) => ({
        ...workflows,
        [id]: {
          id,
          loading: false,
          datapoints: [],
        },
      }));
      return;
    }

    const computationCopy: Calculation = JSON.parse(stringifiedComputation);

    createCalculation(
      { definition: computationCopy },
      {
        onSuccess(res) {
          mutate((oldChart) =>
            updateWorkflow(oldChart!, calculation.id, {
              calls: [
                {
                  ...res,
                  callId: res.id, // (eiriklv): Clean this up
                  callDate: Date.now(),
                  hash: getHash(computationCopy),
                },
              ],
            })
          );
        },
        onError() {
          mutate((oldChart) =>
            updateWorkflow(oldChart!, calculation.id, {
              calls: [],
            })
          );
          setWorkflowState((workflows) => ({
            ...workflows,
            [id]: {
              id,
              loading: false,
              datapoints: [],
            },
          }));
        },
      }
    );
  }, [
    id,
    setWorkflowState,
    stringifiedComputation,
    createCalculation,
    mutate,
    calculation.id,
    isStepsValid,
    enabled,
  ]);

  const currentCallStatus = useCalculationStatus(call?.callId!, {
    refetchInterval,
  });

  const handleRetries = useCallback(() => {
    if (isCallLoading) {
      return;
    }

    if (!call) {
      return;
    }

    if (!currentCallStatus.isError) {
      return;
    }

    if (
      currentCallStatus.data?.status &&
      !['Failed', 'Timeout'].includes(currentCallStatus.data.status)
    ) {
      return;
    }

    runComputation();
  }, [call, currentCallStatus, runComputation, isCallLoading]);

  const handleChanges = useCallback(() => {
    const computationCopy = JSON.parse(stringifiedComputation);

    if (call?.hash === getHash(computationCopy)) {
      return;
    }

    runComputation();
  }, [stringifiedComputation, runComputation, call]);

  useEffect(handleRetries, [handleRetries]);
  useEffect(handleChanges, [handleChanges]);

  const resultQuery = useMemo(() => {
    return {
      items: [],
      start: new Date(dateFrom).getTime(),
      end: new Date(dateTo).getTime(),
      granularity: calculateGranularity(
        [dayjs(dateFrom).valueOf(), dayjs(dateTo).valueOf()],
        CHART_POINTS_PER_SERIES
      ),
      aggregates: [
        'average',
        'min',
        'max',
        'count',
        'sum',
      ] as CalculationResultQueryAggregateEnum[],
      limit: CHART_POINTS_PER_SERIES,
    };
  }, [dateFrom, dateTo]);

  const { data: calculationResult } = useCalculationQueryResult(
    call?.callId,
    resultQuery,
    {
      enabled: currentCallStatus.data?.status === 'Success',
    }
  );

  const callStatus = currentCallStatus.data?.status;

  const {
    data: response,
    isError: responseError,
    refetch: refetchResponse,
  } = useCalculationQueryResult(id, resultQuery, {
    // Some other compoment could have called this hook prematurly, setting it in a completed state
    // in the query cache with null as the response body. It is therefore refetch below then the
    // status is Success.
    enabled: call?.status === 'Success',
  });

  const apiError = currentCallStatus.isError || responseError;

  useEffect(() => {
    if (response === null && call?.status === 'Success') {
      refetchResponse();
    }
  }, [call?.status, response, refetchResponse]);

  useEffect(() => {
    if (
      (callStatus && callStatus !== 'Running' && callStatus !== 'Pending') ||
      apiError
    ) {
      setRefetchInterval(false);
    } else {
      setRefetchInterval(2000);
    }
  }, [call, callStatus, apiError]);

  useEffect(() => {
    setWorkflowState((workflows) => ({
      ...workflows,
      [id]: {
        id,
        loading: currentCallStatus.data?.status !== 'Success',
        status: currentCallStatus.data?.status,
        datapoints: calculationResult
          ? calculationResult.datapoints
          : workflows[id]?.datapoints || [],
        warnings: calculationResult?.warnings || [],
        error: calculationResult?.error,
        isDownsampled:
          calculationResult?.isDownsampled ?? workflows[id]?.isDownsampled,
      },
    }));
  }, [id, calculationResult, setWorkflowState, currentCallStatus.data?.status]);

  return null;
}
