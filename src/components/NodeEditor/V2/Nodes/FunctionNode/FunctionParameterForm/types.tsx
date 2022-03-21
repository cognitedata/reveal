import {
  OperationParameters,
  OperationParametersTypeEnum,
} from '@cognite/calculation-backend';
import { defaultTranslations } from 'components/NodeEditor/translations';

interface ParameterFormBase {
  nodeId: string;
  parameterValues: Record<string, any>;
}

export interface ParameterFormElementProps extends ParameterFormBase {
  parameter: OperationParameters;
  onInputValueChange: (
    param: string,
    type: OperationParametersTypeEnum,
    value: any
  ) => void;
}

export interface ParameterFormProps extends ParameterFormBase {
  parameters: OperationParameters[];
  onParameterValuesChange: (
    nodeId: string,
    formData: { [key: string]: any }
  ) => void;
  translations: typeof defaultTranslations;
}
