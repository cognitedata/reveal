import { Select } from '@cognite/cogs.js';
import { NoDragWrapper } from '../../elements';
import { InputContainer } from './elements';
import FunctionParameterFormLabel from './FunctionParameterFormLabel';
import { ParameterFormElementProps } from './types';

const FunctionParameterSelect = ({
  nodeId,
  parameter,
  parameterValues,
  onInputValueChange,
}: ParameterFormElementProps) => {
  const {
    default_value: _default,
    description,
    name,
    options,
    param,
    type,
  } = parameter;

  const selectOptions = (options || []).map(({ label, value }) => ({
    label: label ?? value,
    value,
  }));
  const defaultOption = selectOptions.find((o) => o.value === _default.value);

  return (
    <InputContainer>
      <FunctionParameterFormLabel label={name} description={description} />
      <NoDragWrapper>
        <Select
          key={`${nodeId}-${param}`}
          value={
            selectOptions.find((o) => o.value === parameterValues[param]) ||
            defaultOption!
          }
          options={selectOptions}
          onChange={(option: { label: string; value: any }) => {
            onInputValueChange(param, type, option.value);
          }}
          closeMenuOnSelect
        />
      </NoDragWrapper>
    </InputContainer>
  );
};

export default FunctionParameterSelect;
