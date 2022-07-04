import { useCallback, useEffect } from 'react';
import { ChartThreshold } from 'models/charts/charts/types/types';
import { useChartAtom } from 'models/charts/charts/atoms/atom';
import { useDebounce } from 'use-debounce';
import {
  useCreateThreshold,
  useThresholdCreator,
  useThresholdIsReady,
  useThresholdResultData,
} from 'hooks/calculation-backend';
import { getHash } from 'utils/hash';
import { usePrevious } from 'react-use';
import { milliseconds } from 'date-fns';
import { omit } from 'lodash';
import { CreateThresholdsParams } from '@cognite/calculation-backend';
import { isThresholdValid } from 'utils/threshold';
import { updateChartThresholdProperties } from 'models/charts/charts/selectors/updates';

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
) => {
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

  const { data: thresholdData } = useThresholdResultData(
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

    const minUnitLiteral: string = String(threshold.filter.minUnit);
    const maxnUnitLiteral: string = String(threshold.filter.maxUnit);

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

  return { data: thresholdData };
};

export default useThresholdsResults;
