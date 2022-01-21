import { Field, useFormikContext } from 'formik';

import { SegmentedControl, Switch } from '@cognite/cogs.js';
import type { CalculationTemplate } from '@cognite/simconfig-api-sdk/rtk';

import {
  FormContainer,
  FormHeader,
  FormRow,
  FormRowStacked,
  NumberField,
  TimeSeriesField,
} from 'components/forms/elements';

export function DataSamplingStep() {
  const { values, setFieldValue } = useFormikContext<CalculationTemplate>();

  return (
    <FormContainer>
      <FormHeader>Data sampling configuration</FormHeader>
      <FormRowStacked>
        <NumberField
          label={(value: number) => (value === 1 ? 'minute' : 'minutes')}
          max={86400}
          min={1}
          name="dataSampling.validationWindow"
          step={1}
          title="Validation window"
          width={180}
        />

        <NumberField
          label={(value: number) => (value === 1 ? 'minute' : 'minutes')}
          max={86400}
          min={1}
          name="dataSampling.samplingWindow"
          step={1}
          title="Sampling window"
          width={180}
        />

        <NumberField
          label={(value: number) => (value === 1 ? 'minute' : 'minutes')}
          max={86400}
          min={1}
          name="dataSampling.granularity"
          step={1}
          title="Granularity"
          width={180}
        />
      </FormRowStacked>

      <FormHeader>
        Logical check
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
                currentKey={values.logicalCheck.check}
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

            <NumberField
              max={100000}
              min={0}
              name="logicalCheck.value"
              step={1}
              title="Value"
              width={120}
            />
          </FormRow>
        </>
      ) : null}

      <FormHeader>
        Steady state detection
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
              max={100000}
              min={0}
              name="steadyStateDetection.minSectionSize"
              step={1}
              title="Min. section size"
              width={120}
            />
            <NumberField
              max={100000}
              min={0}
              name="steadyStateDetection.varThreshold"
              step={1}
              title="Var threshold"
              width={120}
            />
            <NumberField
              max={100000}
              min={0}
              name="steadyStateDetection.slopeThreshold"
              step={1}
              title="Slope threshold"
              width={120}
            />
          </FormRow>
        </>
      ) : null}
    </FormContainer>
  );
}
