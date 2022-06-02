import React, { useMemo } from 'react';
import { useMatch } from 'react-location';

import { ParentSizeModern } from '@visx/responsive';

import classNames from 'classnames';
import { Field, useFormikContext } from 'formik';

import type { OptionType } from '@cognite/cogs.js';
import { Label, Select } from '@cognite/cogs.js';
import type { CalculationTemplate } from '@cognite/simconfig-api-sdk/rtk';

import { TimeseriesChart } from 'components/charts/TimeseriesChart';
import {
  FormContainer,
  FormHeader,
  FormRow,
  TimeSeriesField,
} from 'components/forms/elements';
import {
  getScheduleRepeat,
  useTimeseries,
} from 'pages/CalculationConfiguration/utils';

import { ChartContainer, LoaderOverlay } from '../elements';
import type { StepProps } from '../types';

import { InputInfoDrawer } from './infoDrawers/InputInfoDrawer';

import type { AppLocationGenerics } from 'routes';

export function InputStep({ isDisabled }: StepProps) {
  const { values, setFieldValue } = useFormikContext<CalculationTemplate>();
  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

  const unitTypeOptions = Object.entries(
    definitions?.map.unitType ?? []
  ).reduce<Record<string, OptionType<string>[]>>(
    (options, [unitType, units]) => ({
      ...options,
      [unitType]: Object.entries(units as Record<string, string>).map(
        ([value, label]) => ({
          value,
          label,
        })
      ),
    }),
    {}
  );

  const validationOffset = useMemo(
    () => getScheduleRepeat(values.dataSampling.validationEndOffset ?? '0m'),
    [values.dataSampling.validationEndOffset]
  );

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

  const timeseriesState = useTimeseries({
    timeseries,
    granularity: +values.dataSampling.granularity,
    window: +values.dataSampling.validationWindow,
    endOffset: +validationOffset.minutes,
  });

  return (
    <FormContainer>
      <FormHeader>
        Input configuration
        <InputInfoDrawer />
      </FormHeader>
      {values.inputTimeSeries.map(
        (
          {
            type,
            name,
            unit,
            unitType,
            aggregateType,
            sampleExternalId,
            sensorExternalId,
          },
          index
        ) => (
          <React.Fragment key={`${type}-${name}-${unitType}-${aggregateType}`}>
            <FormHeader>{name}</FormHeader>
            <ChartContainer>
              <div className="form">
                <FormRow>
                  <TimeSeriesField
                    aggregateTypeField={`inputTimeSeries.${index}.aggregateType`}
                    externalIdField={`inputTimeSeries.${index}.sensorExternalId`}
                  />
                </FormRow>
                <FormRow>
                  <div className="cogs-input-container">
                    <div className="title">Unit</div>
                    <Field
                      as={Select}
                      isDisabled={isDisabled}
                      name={`inputTimeSeries.${index}.unit`}
                      options={unitTypeOptions[unitType]}
                      value={unitTypeOptions[unitType].find(
                        (option) => option.value === unit
                      )}
                      closeMenuOnSelect
                      onChange={({ value }: OptionType<string>) => {
                        setFieldValue(`inputTimeSeries.${index}.unit`, value);
                      }}
                    />
                  </div>
                </FormRow>
                <Label icon="Timeseries">
                  <span>
                    Sampled input values will be saved to{' '}
                    <code>{sampleExternalId}</code>
                  </span>
                </Label>
              </div>
              <div
                className={classNames('chart', 'short', {
                  isLoading: timeseriesState.isLoading,
                  isEmpty:
                    !timeseriesState.isLoading &&
                    timeseriesState.timeseries[sensorExternalId]?.datapoints &&
                    !(
                      (timeseriesState.timeseries[sensorExternalId]?.datapoints
                        .length ?? 0) >= 2
                    ),
                })}
              >
                {timeseriesState.isLoading && <LoaderOverlay />}
                {!timeseriesState.isLoading &&
                (timeseriesState.timeseries[sensorExternalId]?.datapoints
                  .length ?? 0) >= 2 ? (
                  <ParentSizeModern>
                    {({ width, height }) => (
                      <TimeseriesChart
                        aggregateType={aggregateType}
                        data={
                          timeseriesState.timeseries[sensorExternalId]
                            ?.datapoints
                        }
                        height={height}
                        width={width}
                        yAxisLabel={unit}
                        fullSize
                      />
                    )}
                  </ParentSizeModern>
                ) : null}
              </div>
            </ChartContainer>
          </React.Fragment>
        )
      )}
    </FormContainer>
  );
}
