import { Input, Select } from '@cognite/cogs.js';
import { Field, useFormikContext, getIn } from 'formik';
import { getSelectEntriesFromMap } from 'utils/formUtils';
import {
  InputArea,
  InputAreaTitle,
  InputFullWidth,
  InputRow,
  InputWithLabelContainer,
  InputLabel,
} from 'components/forms/elements';

import { AGGREGATE_TYPE, ROOT_FINDING_METHOD } from './constants';
import { CalculationConfig } from './types';

interface ComponentProps {
  isEditing: boolean;
}

export function RootFindingSection({
  isEditing,
}: React.PropsWithoutRef<ComponentProps>) {
  const { values, setFieldValue, errors } =
    useFormikContext<CalculationConfig>();

  if (!values.rootFindingSettings) {
    return null;
  }

  return (
    <InputArea>
      <InputAreaTitle level={3}>Root Finding</InputAreaTitle>
      <InputRow>
        <InputWithLabelContainer>
          <InputLabel>Main solution</InputLabel>
          <Field
            as={Select}
            theme="grey"
            isDisabled={!isEditing}
            closeMenuOnSelect
            value={{
              value: values.rootFindingSettings.mainSolution,
              label:
                ROOT_FINDING_METHOD[values.rootFindingSettings.mainSolution],
            }}
            onChange={({ value }: { value: string }) => {
              setFieldValue('rootFindingSettings.mainSolution', value);
            }}
            options={getSelectEntriesFromMap(AGGREGATE_TYPE)}
            name="rootFindingSettings.mainSolution"
            fullWidth
            disabled={!isEditing}
          />
        </InputWithLabelContainer>
        <Field
          as={InputFullWidth}
          title="Tolerance"
          type="number"
          step={0.1}
          name="rootFindingSettings.rootTolerance"
          error={getIn(errors, 'rootFindingSettings.rootTolerance')}
          fullWidth
          disabled={!isEditing}
        />
        <Field
          as={Input}
          title="Lower bound"
          name="rootFindingSettings.bracket.lowerBound"
          type="number"
          error={getIn(errors, 'rootFindingSettings.bracket.lowerBound')}
          fullWidth
          disabled={!isEditing}
        />

        <Field
          as={Input}
          title="Upper bound"
          name="rootFindingSettings.bracket.upperBound"
          error={getIn(errors, 'rootFindingSettings.bracket.upperBound')}
          type="number"
          disabled={!isEditing}
        />
      </InputRow>
    </InputArea>
  );
}
