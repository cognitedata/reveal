import { useEffect, useMemo, useState } from 'react';
import { useThrottle } from 'react-use';

import { ParentSizeModern } from '@visx/responsive';

import { extent } from 'd3';
import { sub } from 'date-fns';
import { Field, useFormikContext } from 'formik';
import styled from 'styled-components/macro';

import type { OptionType } from '@cognite/cogs.js';
import { Select, Skeleton, Switch } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import type { DatapointAggregate } from '@cognite/sdk';
import type {
  AggregateType,
  CalculationTemplate,
} from '@cognite/simconfig-api-sdk/rtk';

import { LogicalCheckChart } from 'components/charts/LogicalCheckChart';
import { SteadyStateDetectionChart } from 'components/charts/SteadyStateDetectionChart';
import type { TemporalDatum } from 'components/charts/types';
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

import type { ScheduleRepeat } from '../types';
import { INTERVAL_OPTIONS, getScheduleRepeat } from '../utils';

import { DataSamplingInfoDrawer } from './infoDrawers/DataSamplingInfoDrawer';
import { LogicalCheckInfoDrawer } from './infoDrawers/LogicalCheckInfoDrawer';
import { SteadyStateDetectionInfoDrawer } from './infoDrawers/SteadyStateDetectionInfoDrawer';

const DATA_SAMPLING_VALUE_THROTTLE = 1000;
const SSD_VALUE_THROTTLE = 500;

export function DataSamplingStep() {
  const { errors, values, setFieldValue, isValid } =
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
    values.dataSampling.granularity,
    DATA_SAMPLING_VALUE_THROTTLE
  );
  const window = useThrottle(
    values.dataSampling.validationWindow,
    DATA_SAMPLING_VALUE_THROTTLE
  );
  const endOffset = useThrottle(
    validationOffset.minutes,
    DATA_SAMPLING_VALUE_THROTTLE
  );
  const minSectionSize = useThrottle(
    values.steadyStateDetection.minSectionSize,
    SSD_VALUE_THROTTLE
  );
  const slopeThreshold = useThrottle(
    values.steadyStateDetection.slopeThreshold,
    SSD_VALUE_THROTTLE
  );
  const varThreshold = useThrottle(
    values.steadyStateDetection.varThreshold,
    SSD_VALUE_THROTTLE
  );

  const ssdAggregateType =
    values.steadyStateDetection.aggregateType ?? 'stepInterpolation';
  const ssdTimeseries = useTimeseries({
    timeseries: values.steadyStateDetection.externalId,
    aggregateType: ssdAggregateType,
    granularity,
    window,
    endOffset,
  });

  const lcAggregateType =
    values.logicalCheck.aggregateType ?? 'stepInterpolation';
  const lcTimeseries = useTimeseries({
    timeseries: values.logicalCheck.externalId,
    aggregateType: lcAggregateType,
    granularity,
    window,
    endOffset,
  });

  const minSectionSizeMax =
    values.dataSampling.validationWindow >= 15
      ? Math.floor(values.dataSampling.validationWindow / 2)
      : 15;

  const steadyStateDetectionChart = useMemo(
    () => (
      <ParentSizeModern>
        {({ width, height }) => (
          <SteadyStateDetectionChart
            aggregateType={ssdAggregateType}
            data={ssdTimeseries.data}
            height={height}
            minSegmentDistance={minSectionSize}
            slopeThreshold={slopeThreshold}
            varianceThreshold={varThreshold}
            width={width}
            yAxisLabel={ssdTimeseries.axisLabel}
          />
        )}
      </ParentSizeModern>
    ),
    [
      minSectionSize,
      slopeThreshold,
      ssdTimeseries.axisLabel,
      ssdTimeseries.data,
      ssdAggregateType,
      varThreshold,
    ]
  );

  const logicalCheckChart = useMemo(
    () => (
      <ParentSizeModern>
        {({ width, height }) => (
          <LogicalCheckChart
            aggregateType={lcAggregateType}
            check={values.logicalCheck.check ?? 'gt'}
            data={lcTimeseries.data}
            height={height}
            threshold={values.logicalCheck.value ?? 0}
            width={width}
            yAxisLabel={lcTimeseries.axisLabel}
          />
        )}
      </ParentSizeModern>
    ),
    [
      lcTimeseries.axisLabel,
      lcTimeseries.data,
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
          <div className="chart short">
            {lcTimeseries.data.length >= 2 && isValid ? (
              logicalCheckChart
            ) : (
              <Skeleton.Rectangle height="100%" width="100%" />
            )}
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
          <div className="chart">
            {ssdTimeseries.data.length >= 2 && isValid ? (
              steadyStateDetectionChart
            ) : (
              <Skeleton.Rectangle height="100%" width="100%" />
            )}
          </div>
        </ChartContainer>
      ) : null}
    </FormContainer>
  );
}

const SelectContainer = styled.div`
  .title {
    display: block;
    margin-bottom: 4px;
    color: var(--cogs-greyscale-grey8);
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  .cogs-select {
    min-width: 120px;
  }
`;

const ChartContainer = styled.div`
  display: flex;
  column-gap: 24px;
  .form {
    flex: 1 1 0;
    display: flex;
    flex-flow: column nowrap;
    row-gap: 6px;
  }
  .chart {
    max-width: 720px;
    height: 240px;
    flex: 1 1 0;
    overflow: hidden;
    &.short {
      height: 180px;
    }
  }
`;

function useTimeseries({
  timeseries,
  granularity,
  window,
  aggregateType,
  limit = 5000,
  endOffset = 0,
}: {
  timeseries: string;
  granularity: number;
  window: number;
  aggregateType: AggregateType;
  limit?: number;
  endOffset?: number;
}) {
  const { client } = useAuthContext();
  const [data, setData] = useState<TemporalDatum[]>([]);
  const [range, setRange] = useState({ min: 0, max: 1 });
  const [step, setStep] = useState(1);
  const [axisLabel, setAxisLabel] = useState('Process sensor');

  useEffect(() => {
    async function getTimeseries() {
      if (!client) {
        return;
      }

      try {
        const {
          items: [{ unit, description }],
        } = await client.timeseries.list({
          filter: {
            externalIdPrefix: timeseries,
          },
        });
        setAxisLabel(`${description.substring(0, 25)} (${unit ?? 'n/a'})`);
      } catch (e) {
        console.error(
          'Error while reading time series (missing permissions?)',
          e
        );
        return;
      }

      try {
        const [{ datapoints }] = await client.datapoints.retrieve({
          items: [
            {
              externalId: timeseries,
              start: sub(new Date(), { minutes: window + endOffset }).getTime(),
              end: sub(new Date(), { minutes: endOffset }),
              aggregates: [aggregateType],
              granularity: `${granularity}m`,
              limit,
            },
          ],
        });

        const mappedDatapoints = (datapoints as DatapointAggregate[]).map(
          (datapoint) => ({
            timestamp: datapoint.timestamp,
            value: datapoint[aggregateType] ?? 0,
          })
        );

        const [min = 0, max = 1] = extent(mappedDatapoints, (dp) => dp.value);

        setData(mappedDatapoints);
        setRange({ min, max });
        setStep(Math.ceil(min / 100) / 100);
      } catch (e) {
        console.error('Error while reading datapoints:', e);
      }
    }
    void getTimeseries();
  }, [
    client,
    client?.datapoints,
    client?.timeseries,
    granularity,
    timeseries,
    window,
    aggregateType,
    limit,
    endOffset,
  ]);

  return {
    data,
    range,
    step,
    axisLabel,
  };
}
