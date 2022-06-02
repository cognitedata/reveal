import { useMemo } from 'react';
import { useThrottle } from 'react-use';

import { ParentSizeModern } from '@visx/responsive';

import classNames from 'classnames';
import { Field, useFormikContext } from 'formik';

import type { OptionType } from '@cognite/cogs.js';
import { Select, Switch } from '@cognite/cogs.js';
import type { CalculationTemplate } from '@cognite/simconfig-api-sdk/rtk';

import { LogicalCheckChart } from 'components/charts/LogicalCheckChart';
import { SteadyStateDetectionChart } from 'components/charts/SteadyStateDetectionChart';
import { SegmentedControl } from 'components/forms/controls/SegmentedControl';
import {
  FormContainer,
  FormHeader,
  FormRow,
  FormRowStacked,
  NumberField,
  SliderNumberField,
  TimeSeriesField,
} from 'components/forms/elements';

import { ChartContainer, LoaderOverlay, SelectContainer } from '../elements';
import type { ScheduleRepeat } from '../types';
import { INTERVAL_OPTIONS, getScheduleRepeat, useTimeseries } from '../utils';

import { DataSamplingInfoDrawer } from './infoDrawers/DataSamplingInfoDrawer';
import { LogicalCheckInfoDrawer } from './infoDrawers/LogicalCheckInfoDrawer';
import { SteadyStateDetectionInfoDrawer } from './infoDrawers/SteadyStateDetectionInfoDrawer';

const DATA_SAMPLING_VALUE_THROTTLE = 1000;
const SSD_VALUE_THROTTLE = 500;

export function DataSamplingStep() {
  const { errors, values, setFieldValue } =
    useFormikContext<CalculationTemplate>();

  const validationOffset = useMemo(
    () => getScheduleRepeat(values.dataSampling.validationEndOffset ?? '0m'),
    [values.dataSampling.validationEndOffset]
  );

  const setValidationOffset = ({
    count = validationOffset.count,
    interval = validationOffset.interval,
  }: Partial<ScheduleRepeat>) => {
    setFieldValue('dataSampling.validationEndOffset', `${count}${interval}`);
  };

  const granularity = useThrottle(
    +values.dataSampling.granularity,
    DATA_SAMPLING_VALUE_THROTTLE
  );
  const window = useThrottle(
    +values.dataSampling.validationWindow,
    DATA_SAMPLING_VALUE_THROTTLE
  );
  const endOffset = useThrottle(
    +validationOffset.minutes,
    DATA_SAMPLING_VALUE_THROTTLE
  );
  const minSectionSize = useThrottle(
    +values.steadyStateDetection.minSectionSize,
    SSD_VALUE_THROTTLE
  );
  const slopeThreshold = useThrottle(
    +values.steadyStateDetection.slopeThreshold,
    SSD_VALUE_THROTTLE
  );
  const varThreshold = useThrottle(
    +values.steadyStateDetection.varThreshold,
    SSD_VALUE_THROTTLE
  );

  const ssdAggregateType =
    values.steadyStateDetection.aggregateType ?? 'stepInterpolation';

  const lcAggregateType =
    values.logicalCheck.aggregateType ?? 'stepInterpolation';

  const timeseries = useMemo(
    () => [
      {
        externalId: values.steadyStateDetection.externalId,
        aggregateType: ssdAggregateType,
      },
      {
        externalId: values.logicalCheck.externalId,
        aggregateType: lcAggregateType,
      },
    ],
    [
      lcAggregateType,
      ssdAggregateType,
      values.logicalCheck.externalId,
      values.steadyStateDetection.externalId,
    ]
  );

  const timeseriesState = useTimeseries({
    timeseries,
    granularity,
    window,
    endOffset,
  });

  const minSectionSizeMax =
    values.dataSampling.validationWindow >= 15
      ? Math.floor(values.dataSampling.validationWindow / 2)
      : 15;

  const steadyStateDetectionTimeseriesState =
    timeseriesState.timeseries[values.steadyStateDetection.externalId];
  const steadyStateDetectionChart = useMemo(
    () => (
      <ParentSizeModern>
        {({ width, height }) => (
          <SteadyStateDetectionChart
            aggregateType={ssdAggregateType}
            data={
              steadyStateDetectionTimeseriesState?.datapoints.map(
                (datapoint) => ({
                  timestamp: datapoint.timestamp,
                  value: datapoint[ssdAggregateType] ?? 0,
                })
              ) ?? []
            }
            granularity={granularity}
            height={height}
            minSegmentDistance={minSectionSize}
            slopeThreshold={slopeThreshold}
            varianceThreshold={varThreshold}
            width={width}
            yAxisLabel={steadyStateDetectionTimeseriesState?.axisLabel}
          />
        )}
      </ParentSizeModern>
    ),
    [
      minSectionSize,
      slopeThreshold,
      steadyStateDetectionTimeseriesState?.axisLabel,
      steadyStateDetectionTimeseriesState?.datapoints,
      granularity,
      ssdAggregateType,
      varThreshold,
    ]
  );

  const logicalCheckTimeseriesState =
    timeseriesState.timeseries[values.logicalCheck.externalId];
  const logicalCheckChart = useMemo(
    () => (
      <ParentSizeModern>
        {({ width, height }) => (
          <LogicalCheckChart
            aggregateType={lcAggregateType}
            check={values.logicalCheck.check ?? 'gt'}
            data={
              logicalCheckTimeseriesState?.datapoints.map((datapoint) => ({
                timestamp: datapoint.timestamp,
                value: datapoint[lcAggregateType] ?? 0,
              })) ?? []
            }
            granularity={granularity}
            height={height}
            threshold={values.logicalCheck.value ?? 0}
            width={width}
            yAxisLabel={logicalCheckTimeseriesState?.axisLabel}
          />
        )}
      </ParentSizeModern>
    ),
    [
      logicalCheckTimeseriesState?.axisLabel,
      logicalCheckTimeseriesState?.datapoints,
      granularity,
      lcAggregateType,
      values.logicalCheck.check,
      values.logicalCheck.value,
    ]
  );

  return (
    <FormContainer>
      <FormHeader>
        Data sampling configuration
        <DataSamplingInfoDrawer />
      </FormHeader>
      <FormRowStacked>
        <NumberField
          label={(value: number) => (value === 1 ? 'minute' : 'minutes')}
          min={15}
          name="dataSampling.validationWindow"
          step={1}
          title="Validation window"
          width={180}
        />

        <NumberField
          label={(value: number) => (value === 1 ? 'minute' : 'minutes')}
          min={0}
          name="dataSampling.samplingWindow"
          step={1}
          title="Sampling window"
          width={180}
        />

        <NumberField
          label={(value: number) => (value === 1 ? 'minute' : 'minutes')}
          min={1}
          name="dataSampling.granularity"
          step={1}
          title="Granularity"
          width={180}
        />
        <SelectContainer>
          <label className="title" htmlFor="validation-offset">
            Validation Offset
          </label>
          <FormRow>
            <NumberField
              id="dataSampling-validationEndOffset"
              min={0}
              name="dataSampling.validationEndOffset"
              setValue={(count: string) => {
                setValidationOffset({ count: +count });
              }}
              step={1}
              value={parseInt(
                values.dataSampling.validationEndOffset ?? '0m',
                10
              )}
              width={80}
            />
            <Field
              as={Select}
              options={INTERVAL_OPTIONS}
              value={validationOffset.intervalOption}
              closeMenuOnSelect
              onChange={({
                value: interval = INTERVAL_OPTIONS[0].value,
              }: OptionType<string>) => {
                setValidationOffset({ interval });
              }}
            />
          </FormRow>
        </SelectContainer>
      </FormRowStacked>

      <FormHeader>
        Logical check
        <LogicalCheckInfoDrawer />
        <Field
          as={Switch}
          checked={values.logicalCheck.enabled}
          defaultChecked={false}
          name="logicalCheck.enabled"
          onChange={(value: boolean) => {
            setFieldValue('logicalCheck.enabled', value);
          }}
        />
      </FormHeader>
      {values.logicalCheck.enabled ? (
        <ChartContainer>
          <div className="form">
            <FormRow>
              <TimeSeriesField
                aggregateTypeField="logicalCheck.aggregateType"
                endOffset={endOffset}
                externalIdField="logicalCheck.externalId"
                window={window}
              />
            </FormRow>
            <FormRow>
              <div className="cogs-input-container">
                <div className="title">Check</div>
                <SegmentedControl
                  currentKey={values.logicalCheck.check ?? ''}
                  error={errors.logicalCheck?.check}
                  fullWidth
                  onButtonClicked={(value: string) => {
                    setFieldValue('logicalCheck.check', value);
                  }}
                >
                  <SegmentedControl.Button aria-label="Equals" key="eq">
                    =
                  </SegmentedControl.Button>
                  <SegmentedControl.Button aria-label="Not equals" key="ne">
                    ≠
                  </SegmentedControl.Button>
                  <SegmentedControl.Button aria-label="Greater than" key="gt">
                    &gt;
                  </SegmentedControl.Button>
                  <SegmentedControl.Button
                    aria-label="Greater than or equal"
                    key="ge"
                  >
                    ≥
                  </SegmentedControl.Button>
                  <SegmentedControl.Button aria-label="Less than" key="lt">
                    &lt;
                  </SegmentedControl.Button>
                  <SegmentedControl.Button
                    aria-label="Less than or equal"
                    key="le"
                  >
                    ≤
                  </SegmentedControl.Button>
                </SegmentedControl>
              </div>

              <NumberField
                name="logicalCheck.value"
                step={0.1}
                title="Value"
                width={120}
              />
            </FormRow>
          </div>
          <div
            className={classNames('chart', 'short', {
              isLoading: timeseriesState.isLoading,
              isEmpty:
                !timeseriesState.isLoading &&
                timeseriesState.timeseries[values.logicalCheck.externalId]
                  ?.datapoints &&
                !(
                  (timeseriesState.timeseries[values.logicalCheck.externalId]
                    ?.datapoints.length ?? 0) >= 2
                ),
            })}
          >
            {timeseriesState.isLoading && <LoaderOverlay />}
            {values.logicalCheck.externalId &&
            (timeseriesState.timeseries[values.logicalCheck.externalId]
              ?.datapoints.length ?? 0) >= 2
              ? logicalCheckChart
              : null}
          </div>
        </ChartContainer>
      ) : null}

      <FormHeader>
        Steady state detection
        <SteadyStateDetectionInfoDrawer />
        <Field
          as={Switch}
          checked={values.steadyStateDetection.enabled}
          defaultChecked={false}
          name="steadyStateDetection.enabled"
          onChange={(value: boolean) => {
            setFieldValue('steadyStateDetection.enabled', value);
          }}
        />
      </FormHeader>
      {values.steadyStateDetection.enabled ? (
        <ChartContainer>
          <div className="form">
            <FormRow>
              <TimeSeriesField
                aggregateTypeField="steadyStateDetection.aggregateType"
                endOffset={endOffset}
                externalIdField="steadyStateDetection.externalId"
                window={window}
              />
            </FormRow>
            <FormRow>
              <SliderNumberField
                max={minSectionSizeMax}
                min={1}
                name="steadyStateDetection.minSectionSize"
                step={1}
                title="Min. section size"
                width={160}
              />
            </FormRow>
            <FormRow>
              <SliderNumberField
                min={0.1}
                name="steadyStateDetection.varThreshold"
                sliderMax={30}
                step={0.1}
                title="Variance threshold"
                width={160}
              />
            </FormRow>
            <FormRow>
              <SliderNumberField
                max={0}
                name="steadyStateDetection.slopeThreshold"
                sliderMin={-8}
                step={0.1}
                title="Slope threshold"
                width={160}
              />
            </FormRow>
          </div>
          <div
            className={classNames('chart', {
              isLoading: timeseriesState.isLoading,
              isEmpty:
                !timeseriesState.isLoading &&
                timeseriesState.timeseries[
                  values.steadyStateDetection.externalId
                ]?.datapoints &&
                !(
                  (timeseriesState.timeseries[
                    values.steadyStateDetection.externalId
                  ]?.datapoints.length ?? 0) >= 2
                ),
            })}
          >
            {timeseriesState.isLoading && <LoaderOverlay />}
            {(steadyStateDetectionTimeseriesState?.datapoints.length ?? 0) >= 2
              ? steadyStateDetectionChart
              : null}
          </div>
        </ChartContainer>
      ) : null}
    </FormContainer>
  );
}
