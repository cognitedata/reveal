import { Checkbox } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import FunctionParameterFormLabel from './FunctionParameterFormLabel';
import { ParameterFormElementProps } from './types';

const ParameterCheckbox = ({
  nodeId,
  parameter,
  functionData,
  onInputValueChange,
}: ParameterFormElementProps) => {
  const { description, name, param, type } = parameter;

  return (
    <CheckboxContainer>
      <FunctionParameterFormLabel label={name} description={description} />
      <Checkbox
        name={`${nodeId}-${param}`}
        checked={functionData[param]}
        onChange={(value) => onInputValueChange(param, type, value)}
      />
    </CheckboxContainer>
  );
};

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export default ParameterCheckbox;
