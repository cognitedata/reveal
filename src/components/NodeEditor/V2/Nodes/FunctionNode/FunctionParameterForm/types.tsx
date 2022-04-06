import {
  OperationVersionParams,
  OperationVersionParamsTypeEnum,
} from '@cognite/calculation-backend';
import { defaultTranslations } from 'components/NodeEditor/translations';

interface ParameterFormBase {
  nodeId: string;
  parameterValues: Record<string, any>;
}

export interface ParameterFormElementProps extends ParameterFormBase {
  parameter: OperationVersionParams;
  onInputValueChange: (
    param: string,
    type: OperationVersionParamsTypeEnum,
    value: any
  ) => void;
}

export interface ParameterFormProps extends ParameterFormBase {
  parameters: OperationVersionParams[];
  onParameterValuesChange: (
    nodeId: string,
    formData: { [key: string]: any }
  ) => void;
  translations: typeof defaultTranslations;
}
