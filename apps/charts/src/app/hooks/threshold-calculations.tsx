import { useCallback, useEffect } from 'react';

import {
  useCreateThreshold,
  useThresholdCreator,
  useThresholdIsReady,
  useThresholdResultData,
} from '@charts-app/hooks/calculation-backend';
import { usePrevious } from '@charts-app/hooks/usePrevious';
import { useChartAtom } from '@charts-app/models/chart/atom';
import { ChartThreshold } from '@charts-app/models/chart/types';
import { updateChartThresholdProperties } from '@charts-app/models/chart/updates-threshold';
import { getHash } from '@charts-app/utils/hash';
import { isThresholdValid } from '@charts-app/utils/threshold';
import { milliseconds } from 'date-fns';
import { omit } from 'lodash';
import { useDebounce } from 'use-debounce';

import {
  CreateThresholdsParams,
  ThresholdResult,
} from '@cognite/calculation-backend';

export const thresholdParameters = (
  dateFrom: string,
  dateTo: string,
  threshold: ChartThreshold,
  identifier: string,
  sourceType: string,
  minUnitLiteral: string,
  maxUnitLiteral: string
): CreateThresholdsParams => {
  const paramsOutput = {
    start_time: new Date(dateFrom).getTime(),
    end_time: new Date(dateTo).getTime(),
    threshold_options: {
      limits: {
        lower: ['between', 'over'].includes(threshold.type)
          ? threshold.lowerLimit
          : undefined,
        upper: ['between', 'under'].includes(threshold.type)
          ? threshold.upperLimit
          : undefined,
      },
      filter: {
        min:
          typeof threshold.filter.minValue === 'number'
            ? milliseconds({ [minUnitLiteral]: threshold.filter.minValue })
            : undefined,
        max:
          typeof threshold.filter.maxValue === 'number'
            ? milliseconds({ [maxUnitLiteral]: threshold.filter.maxValue })
            : undefined,
      },
    },
    ...(sourceType === 'timeseries'
      ? { tag: identifier }
      : { calculation_id: identifier }),
  };
  return paramsOutput;
};

const useThresholdsResults = (
  threshold: ChartThreshold | undefined,
  sourceType: string,
  identifier: string
): {
  data: ThresholdResult | undefined;
  isLoading: boolean;
} => {
  const thresholdCalls = threshold?.calls?.[0];
  const [chart, setChart] = useChartAtom();

  const { dateFrom, dateTo } = chart!;

  const thresholdValues = JSON.stringify(
    omit(threshold, ['name', 'id', 'visible', 'calls'])
  );

  const previousThresholdValues = usePrevious<string | undefined>(
    thresholdValues
  );

  const thresholdValuesChanged = previousThresholdValues !== thresholdValues;

  /**
   * Using strings to avoid custom equality check
   */
  const datesAsString = JSON.stringify({ dateFrom, dateTo });

  const [debouncedDatesAsString] = useDebounce(datesAsString, 3000);
  const debouncedPrevDatesAsString = usePrevious<string>(
    debouncedDatesAsString
  );

  const { data: callStatus, error: callStatusError } = useThresholdIsReady(
    thresholdCalls?.callId
  );

  const { data: thresholdData, isLoading } = useThresholdResultData(
    thresholdCalls?.callId,
    callStatus
  );

  const { results: thresholdResult } = thresholdData || {};
  const { mutate: callFunction } = useCreateThreshold();
  const memoizedCallFunction = useCallback(callFunction, [callFunction]);
  const createThreshold = useThresholdCreator();

  const updateThreshold = useCallback(
    (diff: Partial<ChartThreshold>) => {
      if (!threshold) return;
      setChart((oldChart) =>
        updateChartThresholdProperties(oldChart!, threshold.id, diff)
      );
    },
    [setChart, threshold]
  );

  const datesChanged =
    debouncedPrevDatesAsString &&
    debouncedPrevDatesAsString !== debouncedDatesAsString;

  useEffect(() => {
    if (!threshold) {
      return;
    }

    if (!isThresholdValid(threshold)) {
      return;
    }

    if (!thresholdValuesChanged && !datesChanged) {
      if (thresholdResult) {
        return;
      }
      if (thresholdCalls && !callStatusError) {
        return;
      }
    }

    if (!identifier) {
      return;
    }

    const minUnitLiteral = String(threshold.filter.minUnit);
    const maxnUnitLiteral = String(threshold.filter.maxUnit);

    const params = thresholdParameters(
      dateFrom,
      dateTo,
      threshold,
      identifier,
      sourceType,
      minUnitLiteral,
      maxnUnitLiteral
    );

    const hashOfParams = getHash(params);

    if (hashOfParams === thresholdCalls?.hash && !callStatusError) {
      return;
    }

    createThreshold({
      thresholdParameters: params,
      onCreateThreshold: memoizedCallFunction,
      onUpdateThreshold: updateThreshold,
    });
  }, [
    threshold,
    sourceType,
    identifier,
    memoizedCallFunction,
    dateFrom,
    dateTo,
    updateThreshold,
    thresholdResult,
    thresholdCalls,
    callStatus,
    callStatusError,
    datesChanged,
    thresholdValuesChanged,
    createThreshold,
  ]);

  return { data: thresholdData, isLoading };
};

export default useThresholdsResults;
