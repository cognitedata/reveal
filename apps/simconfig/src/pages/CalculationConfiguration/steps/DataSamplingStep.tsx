import { useMemo } from 'react';

import { Field, useFormikContext } from 'formik';
import styled from 'styled-components/macro';

import type { OptionType } from '@cognite/cogs.js';
import { Select, Switch } from '@cognite/cogs.js';
import type { CalculationTemplate } from '@cognite/simconfig-api-sdk/rtk';

import { SegmentedControl } from 'components/forms/controls/SegmentedControl';
import {
  FormContainer,
  FormHeader,
  FormRow,
  FormRowStacked,
  NumberField,
  TimeSeriesField,
} from 'components/forms/elements';

import type { ScheduleRepeat } from '../types';
import { INTERVAL_OPTIONS, getScheduleRepeat } from '../utils';

import { DataSamplingInfoDrawer } from './infoDrawers/DataSamplingInfoDrawer';
import { LogicalCheckInfoDrawer } from './infoDrawers/LogicalCheckInfoDrawer';
import { SteadyStateDetectionInfoDrawer } from './infoDrawers/SteadyStateDetectionInfoDrawer';

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
        <>
          <FormRow>
            <TimeSeriesField
              aggregateTypeField="logicalCheck.aggregateType"
              externalIdField="logicalCheck.externalId"
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
                <SegmentedControl.Button key="eq">=</SegmentedControl.Button>
                <SegmentedControl.Button key="ne">≠</SegmentedControl.Button>
                <SegmentedControl.Button key="gt">&gt;</SegmentedControl.Button>
                <SegmentedControl.Button key="ge">≥</SegmentedControl.Button>
                <SegmentedControl.Button key="lt">&lt;</SegmentedControl.Button>
                <SegmentedControl.Button key="le">≤</SegmentedControl.Button>
              </SegmentedControl>
            </div>

            <NumberField name="logicalCheck.value" title="Value" width={120} />
          </FormRow>
        </>
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
        <>
          <FormRow>
            <TimeSeriesField
              aggregateTypeField="steadyStateDetection.aggregateType"
              externalIdField="steadyStateDetection.externalId"
            />
          </FormRow>
          <FormRow>
            <NumberField
              min={0}
              name="steadyStateDetection.minSectionSize"
              title="Min. section size"
              width={120}
            />
            <NumberField
              min={0}
              name="steadyStateDetection.varThreshold"
              title="Var threshold"
              width={120}
            />
            <NumberField
              max={0}
              name="steadyStateDetection.slopeThreshold"
              title="Slope threshold"
              width={120}
            />
          </FormRow>
        </>
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
