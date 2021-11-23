import { Button, Input, Switch, Select } from '@cognite/cogs.js';
import { Field, useFormikContext } from 'formik';
import { getSelectEntriesFromMap } from 'utils/formUtils';
import {
  InputArea,
  InputAreaTitle,
  InputFullWidth,
  InputRow,
  SectionTitle,
  InputWithLabelContainer,
  InputLabel,
} from 'components/forms/elements';

import { AGGREGATE_TYPE, CHECK_TYPE } from './constants';
import { CalculationConfig } from './types';

interface ComponentProps {
  isEditing: boolean;
}

export function DataSamplingSection({
  isEditing,
}: React.PropsWithoutRef<ComponentProps>) {
  const { values, setFieldValue, errors } =
    useFormikContext<CalculationConfig>();

  const logicalCheckEnabled = values.logicalCheck.enabled;
  const steadyStateDetectionEnabled = values.steadyStateDetection.enabled;

  return (
    <>
      <SectionTitle level={2}>Data Sampling</SectionTitle>

      <InputArea>
        <InputAreaTitle level={3}>Configuration</InputAreaTitle>
        <InputRow>
          <Field
            type="number"
            as={Input}
            title="Validation Window"
            name="dataSampling.validationWindow"
            disabled={!isEditing}
            error={errors?.dataSampling?.validationWindow}
            postfix={<Button disabled>Min</Button>}
          />
          <Field
            as={Input}
            title="Sampling Window"
            name="dataSampling.samplingWindow"
            disabled={!isEditing}
            error={errors?.dataSampling?.samplingWindow}
            type="number"
            postfix={<Button disabled>Min</Button>}
          />
          <Field
            as={Input}
            title="Granularity"
            name="dataSampling.granularity"
            disabled={!isEditing}
            postfix={<Button disabled>Min</Button>}
          />
        </InputRow>
      </InputArea>
      <InputArea>
        <InputAreaTitle level={3}>
          Logical check
          <Switch
            disabled={!isEditing}
            value={values.logicalCheck.enabled}
            name="logicalCheck.enabled"
            onChange={(value: boolean) =>
              setFieldValue('logicalCheck.enabled', value)
            }
          />
        </InputAreaTitle>
        <InputRow>
          <Field
            as={InputFullWidth}
            title="Time series"
            name="logicalCheck.externalId"
            fullWidth
            disabled
          />
          <InputWithLabelContainer>
            <InputLabel>Sampling method</InputLabel>
            <Field
              as={Select}
              theme="grey"
              isDisabled={!isEditing || !logicalCheckEnabled}
              closeMenuOnSelect
              value={{
                value: values.logicalCheck.aggregateType,
                label: AGGREGATE_TYPE[values.logicalCheck.aggregateType],
              }}
              onChange={({ value }: { value: string }) => {
                setFieldValue('logicalCheck.aggregateType', value);
              }}
              options={getSelectEntriesFromMap(AGGREGATE_TYPE)}
              name="logicalCheck.aggregateType"
              fullWidth
              disabled={!isEditing || !logicalCheckEnabled}
            />
          </InputWithLabelContainer>
          <InputWithLabelContainer>
            <InputLabel>Check</InputLabel>
            <Field
              as={Select}
              theme="grey"
              isDisabled={!isEditing || !logicalCheckEnabled}
              closeMenuOnSelect
              value={{
                value: values.logicalCheck.check,
                label: CHECK_TYPE[values.logicalCheck.check],
              }}
              onChange={({ value }: { value: string }) => {
                setFieldValue('logicalCheck.check', value);
              }}
              options={getSelectEntriesFromMap(CHECK_TYPE)}
              name="logicalCheck.check"
              fullWidth
              disabled={!isEditing || !logicalCheckEnabled}
            />
          </InputWithLabelContainer>

          <Field
            as={Input}
            title="Value"
            name="logicalCheck.value"
            type="number"
            step={0.5}
            disabled={!isEditing || !logicalCheckEnabled}
          />
        </InputRow>
      </InputArea>
      <InputArea>
        <InputAreaTitle level={3}>
          Steady state detection
          <Switch
            value={values.steadyStateDetection.enabled}
            disabled={!isEditing}
            name="steadyStateDetection.enabled"
            onChange={(value: boolean) =>
              setFieldValue('steadyStateDetection.enabled', value)
            }
          />
        </InputAreaTitle>
        <InputRow>
          <Field
            as={InputFullWidth}
            title="Time series"
            name="steadyStateDetection.externalId"
            disabled
            fullWidth
          />
          <InputWithLabelContainer>
            <InputLabel>Sampling method</InputLabel>
            <Field
              as={Select}
              theme="grey "
              isDisabled={!isEditing || !steadyStateDetectionEnabled}
              closeMenuOnSelect
              value={{
                value: values.steadyStateDetection.aggregateType,
                label:
                  AGGREGATE_TYPE[values.steadyStateDetection.aggregateType],
              }}
              onChange={({ value }: { value: string }) => {
                setFieldValue('steadyStateDetection.aggregateType', value);
              }}
              options={getSelectEntriesFromMap(AGGREGATE_TYPE)}
              name="steadyStateDetection.aggregateType"
              fullWidth
              disabled={!isEditing || !steadyStateDetectionEnabled}
            />
          </InputWithLabelContainer>
          <Field
            as={Input}
            title="Min Section Size"
            name="steadyStateDetection.minSectionSize"
            type="number"
            error={errors?.steadyStateDetection?.minSectionSize}
            disabled={!isEditing || !steadyStateDetectionEnabled}
          />
          <Field
            as={Input}
            title="Var threshold"
            name="steadyStateDetection.varThreshold"
            type="number"
            error={errors?.steadyStateDetection?.varThreshold}
            disabled={!isEditing || !steadyStateDetectionEnabled}
          />
          <Field
            as={Input}
            title="Slope threshold"
            name="steadyStateDetection.slopeThreshold"
            type="number"
            error={errors?.steadyStateDetection?.slopeThreshold}
            disabled={!isEditing || !steadyStateDetectionEnabled}
          />
        </InputRow>
      </InputArea>
    </>
  );
}
