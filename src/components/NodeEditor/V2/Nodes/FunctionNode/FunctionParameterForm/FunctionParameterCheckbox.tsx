import { Switch } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import FunctionParameterFormLabel from './FunctionParameterFormLabel';
import { ParameterFormElementProps } from './types';

const ParameterCheckbox = ({
  nodeId,
  parameter,
  parameterValues,
  onInputValueChange,
}: ParameterFormElementProps) => {
  const { description, name, param, type } = parameter;

  return (
    <CheckboxContainer>
      <Switch
        name={`${nodeId}-${param}`}
        value={parameterValues[param]}
        onChange={(value) => onInputValueChange(param, type, value)}
      >
        <FunctionParameterFormLabel label={name} description={description} />
      </Switch>
    </CheckboxContainer>
  );
};

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 5px;
`;

export default ParameterCheckbox;
