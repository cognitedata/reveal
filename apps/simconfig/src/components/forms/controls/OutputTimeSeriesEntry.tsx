import React from 'react';
import {
  InputArea,
  InputAreaTitle,
  InputFullWidth,
  InputRow,
  InputWithLabelContainer,
  InputLabel,
} from 'components/forms/elements';
import { UNIT_TYPE } from 'components/forms/ConfigurationForm/constants';
import { getSelectEntriesFromMap } from 'utils/formUtils';
import { Field, useFormikContext } from 'formik';
import { Select } from '@cognite/cogs.js';
import {
  CalculationConfig,
  ConfigOutputTimeSeries,
} from 'components/forms/ConfigurationForm/types';

interface ComponentProps {
  timeSeries: ConfigOutputTimeSeries;
  namePrefix: string;
}
const OutputTimeSeriesEntry = ({
  timeSeries,
  namePrefix,
}: React.PropsWithoutRef<ComponentProps>) => {
  const { unitType, unit, name } = timeSeries;
  const { setFieldValue } = useFormikContext<CalculationConfig>();
  const UNIT = UNIT_TYPE[unitType];

  return (
    <InputArea>
      <InputAreaTitle level={3}>{name}</InputAreaTitle>
      <InputRow>
        <Field
          as={InputFullWidth}
          title="Time series"
          value={timeSeries.externalId}
          name={`${namePrefix}.externalId`}
          width="500px"
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
      </InputRow>
    </InputArea>
  );
};

export default OutputTimeSeriesEntry;
