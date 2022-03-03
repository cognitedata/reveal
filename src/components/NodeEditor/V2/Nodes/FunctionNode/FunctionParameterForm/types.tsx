import {
  OperationParameters,
  OperationParametersTypeEnum,
} from '@cognite/calculation-backend';
import { defaultTranslations } from 'components/NodeEditor/translations';

export type ParameterFormBase = {
  nodeId: string;
  parameterValues: { [key: string]: any };
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
  onParameterValuesChange: (
    nodeId: string,
    formData: { [key: string]: any }
  ) => void;
  translations: typeof defaultTranslations;
};
