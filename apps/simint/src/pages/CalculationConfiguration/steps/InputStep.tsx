import React, { useMemo } from 'react';
import { useMatch } from 'react-location';

import { ParentSizeModern } from '@visx/responsive';
import classNames from 'classnames';
import { Field, useFormikContext } from 'formik';

import type { OptionType } from '@cognite/cogs.js';
import { Infobox, Select } from '@cognite/cogs.js';
import type { CalculationTemplate } from '@cognite/simconfig-api-sdk/rtk';

import { TimeseriesChart } from '../../../components/charts/TimeseriesChart';
import {
  FormContainer,
  FormHeader,
  FormRow,
  TimeSeriesField,
} from '../../../components/forms/elements';
import type { AppLocationGenerics } from '../../../routes';
import { getOptionLabel } from '../../CustomCalculationConfiguration/Routine/Commands/utils';
import { ChartContainer, LoaderOverlay } from '../elements';
import type { StepProps } from '../types';
import { getScheduleRepeat, useTimeseries } from '../utils';

import { InputInfoDrawer } from './infoDrawers/InputInfoDrawer';

export function InputStep({ isDisabled }: StepProps) {
  const { values, setFieldValue } = useFormikContext<CalculationTemplate>();
  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

  const simulatorConfig = definitions?.simulatorsConfig?.find(
    (config) => config.key === values.simulator
  );
  const unitsMap = simulatorConfig?.unitDefinitions.unitsMap ?? {};

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
                      disabled={isDisabled}
                      name={`inputTimeSeries.${index}.unit`}
                      options={
                        unitsMap[unitType] ? unitsMap[unitType].units : []
                      }
                      value={getOptionLabel(
                        unitsMap[unitType] ? unitsMap[unitType].units : [],
                        unit ?? ''
                      )}
                      closeMenuOnSelect
                      onChange={({ value }: OptionType<string>) => {
                        setFieldValue(`inputTimeSeries.${index}.unit`, value);
                      }}
                    />
                  </div>
                </FormRow>
                <Infobox type="neutral">
                  Sampled input values will be saved to{' '}
                  <code>{sampleExternalId}</code>
                </Infobox>
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
