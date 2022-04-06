import { Button, Input, InputProps } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import { OperationVersionParamsTypeEnum } from '@cognite/calculation-backend';
import { useState } from 'react';
import { defaultTranslations } from 'components/NodeEditor/translations';
import { transformParamInput } from '../../../transforms';
import FunctionParameterFormLabel from './FunctionParameterFormLabel';
import { ParameterFormProps } from './types';
import FunctionParameterSelect from './FunctionParameterSelect';
import { InputContainer } from './elements';
import FunctionParameterCheckbox from './FunctionParameterCheckbox';
import { NoDragWrapper } from '../../elements';

const FunctionParameterForm = ({
  nodeId,
  parameters,
  parameterValues = {},
  onParameterValuesChange,
  translations,
}: ParameterFormProps) => {
  const t = {
    ...defaultTranslations,
    ...translations,
  };
  if (parameters.length === 0)
    throw new Error('Missing parameters for generating the form');
  const [formData, setFormData] =
    useState<{ [key: string]: any }>(parameterValues);

  const handleFormValueChange = (
    param: string,
    type: OperationVersionParamsTypeEnum,
    value: any
  ) => {
    setFormData({ ...formData, [param]: transformParamInput(type, value) });
  };

  const inputProps = (type: OperationVersionParamsTypeEnum): InputProps => {
    switch (type) {
      case OperationVersionParamsTypeEnum.Int:
        return { type: 'tel' };
      case OperationVersionParamsTypeEnum.Float:
        return { type: 'number', step: 0.01 };
      default:
        return { type: 'text' };
    }
  };

  return (
    <ParameterFormWrapper>
      {parameters.map((parameter) => {
        const { description, name, options, type, param } = parameter;

        if (options?.length) {
          return (
            <FunctionParameterSelect
              key={`${nodeId}-${param}`}
              nodeId={nodeId}
              parameter={parameter}
              parameterValues={formData}
              onInputValueChange={handleFormValueChange}
            />
          );
        }

        if (type === OperationVersionParamsTypeEnum.Bool) {
          return (
            <FunctionParameterCheckbox
              key={`${nodeId}-${param}`}
              nodeId={nodeId}
              parameter={parameter}
              parameterValues={formData}
              onInputValueChange={handleFormValueChange}
            />
          );
        }
        return (
          <InputContainer key={`${nodeId}-${param}`}>
            <FunctionParameterFormLabel
              label={name}
              description={description}
            />
            <NoDragWrapper>
              <Input
                {...inputProps(type)}
                name={name}
                value={formData[param]}
                onChange={(event) =>
                  handleFormValueChange(param, type, event.target.value)
                }
                onDoubleClick={(e) => e.stopPropagation()}
              />
            </NoDragWrapper>
          </InputContainer>
        );
      })}
      <SaveButton
        type="primary"
        onClick={() => onParameterValuesChange(nodeId, formData)}
      >
        {t.Done}
      </SaveButton>
    </ParameterFormWrapper>
  );
};

const ParameterFormWrapper = styled.div`
  margin-top: 10px;
`;

const SaveButton = styled(Button)`
  width: 100%;
  margin-top: 10px;
`;

export default FunctionParameterForm;
