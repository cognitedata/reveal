import { useMemo } from 'react';

import { useFormikContext } from 'formik';

import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { FormRow, TimeSeriesField } from 'components/forms/elements';
import {
  getScheduleRepeat,
  useTimeseries,
} from 'pages/CalculationConfiguration/utils';

import { SelectBox, StepsContainer } from '../../elements';

import {
  InputType,
  OpenServerAddress,
  StepType,
  Unit,
  UnitType,
  Value,
  Variable,
} from './Fields';
import { TimeSeriesPreview } from './Fields/TimeSeriesPreview';
import type { StepCommandProps } from './utils';
import { getTimeSerieIndexByType } from './utils';

export function Set({ step, routineOrder, stepIndex }: StepCommandProps) {
  const isTimeSeriesStep = step.arguments.type === 'inputTimeSeries';
  const routineIndex = routineOrder;
  const props = { routineIndex, step, stepIndex };
  const { values } = useFormikContext<UserDefined>();
  const isVariableDefined =
    getTimeSerieIndexByType(
      values.inputTimeSeries,
      step.arguments.value ?? ''
    ) !== -1;

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
          {isTimeSeriesStep && <Variable {...props} />}
          <OpenServerAddress {...props} />
          {!isTimeSeriesStep && <Value {...props} />}

          {isTimeSeriesStep && isVariableDefined && (
            <>
              <UnitType {...props} />
              <Unit {...props} />
            </>
          )}
        </SelectBox>

        {isTimeSeriesStep && isVariableDefined && (
          <FormRow>
            <TimeSeriesField
              aggregateTypeField={`inputTimeSeries.${getTimeSerieIndexByType(
                values.inputTimeSeries,
                step.arguments.value ?? ''
              )}.aggregateType`}
              externalIdField={`inputTimeSeries.${getTimeSerieIndexByType(
                values.inputTimeSeries,
                step.arguments.value ?? ''
              )}.sensorExternalId`}
              width={305}
            />
          </FormRow>
        )}
      </StepsContainer>

      {isTimeSeriesStep && step.arguments.value && (
        <TimeSeriesPreview
          aggregateType={
            values.inputTimeSeries[
              getTimeSerieIndexByType(
                values.inputTimeSeries,
                step.arguments.value
              )
            ].aggregateType
          }
          inputTimeseries={values.inputTimeSeries}
          step={step}
          timeseriesState={timeseriesState}
        />
      )}
    </div>
  );
}
