import { useEffect, useMemo } from 'react';

import {
  FormRow,
  TimeSeriesField,
} from '@simint-app/components/forms/elements';
import {
  getScheduleRepeat,
  useTimeseries,
} from '@simint-app/pages/CalculationConfiguration/utils';
import { generateInputTimeSeriesExternalId } from '@simint-app/utils/externalIdGenerators';
import { useFormikContext } from 'formik';

import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { SelectBox, StepsContainer } from '../../elements';

import {
  DynamicFields,
  InputType,
  StepType,
  Unit,
  UnitType,
  Value,
  Variable,
} from './Fields';
import { TimeSeriesPreview } from './Fields/TimeSeriesPreview';
import type { StepCommandProps } from './utils';
import { getTimeSerieIndexByType } from './utils';

export function Set({
  dynamicStepFields,
  step,
  routineOrder,
  stepIndex,
}: StepCommandProps) {
  const isTimeSeriesStep = step.arguments.type === 'inputTimeSeries';
  const routineIndex = routineOrder;
  const props = { routineIndex, step, stepIndex, dynamicStepFields };
  const { values, setFieldValue } = useFormikContext<UserDefined>();
  const timeSerieIndex = getTimeSerieIndexByType(
    values.inputTimeSeries,
    step.arguments.value ?? ''
  );

  useEffect(() => {
    if (timeSerieIndex !== -1) {
      const currentTs = values.inputTimeSeries[timeSerieIndex];
      const generateSampleExternalId = generateInputTimeSeriesExternalId({
        simulator: values.simulator,
        calculationType: values.calculationName,
        modelName: values.modelName,
        timeSeriesType: currentTs.type,
      });
      setFieldValue(
        `inputTimeSeries.${timeSerieIndex}.sampleExternalId`,
        generateSampleExternalId
      );
    }
  }, [values.inputTimeSeries]);

  const isVariableDefined = timeSerieIndex !== -1;

  const timeseries = useMemo(
    () =>
      values.inputTimeSeries.map(
        ({ sensorExternalId: externalId, aggregateType }) => ({
          externalId,
          aggregateType,
        })
      ),
    [values.inputTimeSeries]
  );

  const validationOffset = useMemo(
    () => getScheduleRepeat(values.dataSampling.validationEndOffset ?? '0m'),
    [values.dataSampling.validationEndOffset]
  );

  const timeseriesState = useTimeseries({
    timeseries,
    granularity: +values.dataSampling.granularity,
    window: +values.dataSampling.validationWindow,
    endOffset: +validationOffset.minutes,
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <StepsContainer>
        <SelectBox>
          <StepType {...props} />
          <InputType {...props} />
          {isTimeSeriesStep && (
            <Variable {...props} timeSeriesPrefix="inputTimeSeries" />
          )}
          {!isTimeSeriesStep && <Value {...props} />}

          {isTimeSeriesStep && isVariableDefined && (
            <FormRow>
              <UnitType {...props} timeSeriesPrefix="inputTimeSeries" />
              <Unit {...props} timeSeriesPrefix="inputTimeSeries" />
            </FormRow>
          )}
        </SelectBox>

        {isTimeSeriesStep && isVariableDefined && (
          <FormRow>
            <TimeSeriesField
              aggregateTypeField={`inputTimeSeries.${timeSerieIndex}.aggregateType`}
              externalIdField={`inputTimeSeries.${timeSerieIndex}.sensorExternalId`}
              width={305}
            />
          </FormRow>
        )}

        <SelectBox>
          <DynamicFields {...props} />
        </SelectBox>
      </StepsContainer>

      {isTimeSeriesStep && step.arguments.value && (
        <TimeSeriesPreview
          aggregateType={values.inputTimeSeries[timeSerieIndex].aggregateType}
          inputTimeseries={values.inputTimeSeries}
          step={step}
          timeseriesState={timeseriesState}
        />
      )}
    </div>
  );
}
