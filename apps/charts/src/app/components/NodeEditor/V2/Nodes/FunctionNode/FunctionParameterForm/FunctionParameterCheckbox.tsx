import styled from 'styled-components/macro';

import { Switch } from '@cognite/cogs.js';

import { ParameterFormElementProps } from './types';

const ParameterCheckbox = ({
  nodeId,
  parameter,
  parameterValues,
  onInputValueChange,
}: ParameterFormElementProps) => {
  const { name, param, type } = parameter;

  return (
    <CheckboxContainer>
      <Switch
        name={`${nodeId}-${param}`}
        label={name}
        checked={parameterValues[param]}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          onInputValueChange(param, type, event.target.checked)
        }
      />
    </CheckboxContainer>
  );
};

const CheckboxContainer = styled.div`
  &&& {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 5px;
  }
`;

export default ParameterCheckbox;
