import {
  OperationParameters,
  OperationParametersTypeEnum,
} from '@cognite/calculation-backend';

export type ParameterFormBase = {
  nodeId: string;
  functionData: { [key: string]: any };
};

export type ParameterFormElementProps = ParameterFormBase & {
  parameter: OperationParameters;
  onInputValueChange: (
    param: string,
    type: OperationParametersTypeEnum,
    value: any
  ) => void;
};

export type ParameterFormProps = ParameterFormBase & {
  parameters: OperationParameters[];
  onFunctionDataChange: (
    nodeId: string,
    formData: { [key: string]: any }
  ) => void;
};
