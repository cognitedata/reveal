import React from 'react';
import {
  InputArea,
  InputAreaTitle,
  InputFullWidth,
  InputInfoRow,
  InputRow,
  InputWithLabelContainer,
  InputLabel,
} from 'components/forms/elements';
import {
  AGGREGATE_TYPE,
  UNIT_TYPE,
} from 'components/forms/ConfigurationForm/constants';
import { getSelectEntriesFromMap } from 'utils/formUtils';
import { Field, useFormikContext } from 'formik';
import { Icon, Select } from '@cognite/cogs.js';
import {
  CalculationConfig,
  ConfigInputTimeSeries,
} from 'components/forms/ConfigurationForm/types';
import { generateInputTimeSeriesExternalId } from 'utils/externalIdGenerators';

interface ComponentProps {
  timeSeries: ConfigInputTimeSeries;
  namePrefix: string;
}
const InputTimeSeriesEntry = ({
  timeSeries,
  namePrefix,
}: React.PropsWithoutRef<ComponentProps>) => {
  const { setFieldValue, values } = useFormikContext<CalculationConfig>();
  const { unitType, unit, name, aggregateType, type } = timeSeries;

  const UNIT = UNIT_TYPE[unitType];

  const sampledExternalId = generateInputTimeSeriesExternalId({
    simulator: values.simulator,
    calculationType: values.calculationType,
    timeSeriesType: type,
    modelName: values.modelName,
  });

  return (
    <InputArea>
      <InputAreaTitle level={3}>{name}</InputAreaTitle>
      <InputRow>
        <Field
          as={InputFullWidth}
          title="Time series"
          value={timeSeries.sensorExternalId}
          name={`${namePrefix}.externalId`}
          fullWidth
          disabled
        />
        <InputWithLabelContainer>
          <InputLabel>Unit</InputLabel>
          <Field
            as={Select}
            theme="grey "
            isDisabled
            closeMenuOnSelect
            value={{
              value: unit,
              label: UNIT[unit],
            }}
            onChange={({ value }: { value: string }) => {
              setFieldValue(`${namePrefix}.unit`, value);
            }}
            options={getSelectEntriesFromMap(UNIT)}
            name={`${namePrefix}.unit`}
            fullWidth
            disabled
          />
        </InputWithLabelContainer>

        <InputWithLabelContainer>
          <InputLabel>Sampling Method</InputLabel>
          <Field
            as={Select}
            theme="grey "
            isDisabled
            closeMenuOnSelect
            value={{
              value: aggregateType,
              label: AGGREGATE_TYPE[aggregateType],
            }}
            onChange={({ value }: { value: string }) => {
              setFieldValue(`${namePrefix}.aggregateType`, value);
            }}
            options={getSelectEntriesFromMap(AGGREGATE_TYPE)}
            name={`${namePrefix}.aggregateType`}
            fullWidth
            disabled
          />
        </InputWithLabelContainer>
      </InputRow>
      <InputInfoRow>
        <Icon type="Info" />
        Sampled input values saved to: {sampledExternalId}
      </InputInfoRow>
    </InputArea>
  );
};

export default InputTimeSeriesEntry;
