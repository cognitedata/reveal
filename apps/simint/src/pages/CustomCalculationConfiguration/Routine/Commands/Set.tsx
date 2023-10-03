import { useEffect, useMemo } from 'react';

import { useFormikContext } from 'formik';

import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import {
  FormRow,
  TimeSeriesField,
} from '../../../../components/forms/elements';
import { generateInputTimeSeriesExternalId } from '../../../../utils/externalIdGenerators';
import {
  getScheduleRepeat,
  useTimeseries,
} from '../../../CalculationConfiguration/utils';
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
import { getInputOutputIndex } from './utils';

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
  const { index: inputOutputIndex, didFindEntry } = getInputOutputIndex(
    values.inputTimeSeries,
    step.arguments.value ?? ''
  );

  useEffect(() => {
    if (didFindEntry) {
      const currentTs = values.inputTimeSeries[inputOutputIndex];
      const generateSampleExternalId = generateInputTimeSeriesExternalId({
        simulator: values.simulator,
        calculationType: values.calculationName,
        modelName: values.modelName,
        timeSeriesType: currentTs.type,
      });
      setFieldValue(
        `inputTimeSeries.${inputOutputIndex}.sampleExternalId`,
        generateSampleExternalId
      );
    }
  }, [values.inputTimeSeries]);

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

          {isTimeSeriesStep && didFindEntry && (
            <FormRow>
              <UnitType {...props} timeSeriesPrefix="inputTimeSeries" />
              <Unit {...props} timeSeriesPrefix="inputTimeSeries" />
            </FormRow>
          )}
        </SelectBox>

        {isTimeSeriesStep && didFindEntry && (
          <FormRow>
            <TimeSeriesField
              aggregateTypeField={`inputTimeSeries.${inputOutputIndex}.aggregateType`}
              externalIdField={`inputTimeSeries.${inputOutputIndex}.sensorExternalId`}
              width={305}
            />
          </FormRow>
        )}

        <SelectBox>
          <DynamicFields {...props} />
        </SelectBox>

        {!isTimeSeriesStep && <Value {...props} />}

        {!isTimeSeriesStep && (
          <FormRow>
            <UnitType {...props} timeSeriesPrefix="inputConstants" />
            <Unit {...props} timeSeriesPrefix="inputConstants" />
          </FormRow>
        )}
      </StepsContainer>

      {isTimeSeriesStep && step.arguments.value && (
        <TimeSeriesPreview
          aggregateType={values.inputTimeSeries[inputOutputIndex].aggregateType}
          inputTimeseries={values.inputTimeSeries}
          step={step}
          timeseriesState={timeseriesState}
        />
      )}
    </div>
  );
}
