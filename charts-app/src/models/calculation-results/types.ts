import {
  CalculationResult,
  StatusStatusEnum,
} from '@cognite/calculation-backend';
import { DatapointAggregate, DoubleDatapoint } from '@cognite/sdk';

export type WorkflowResult = {
  id: string;
  datapoints: DoubleDatapoint[] | DatapointAggregate[];
  warnings?: CalculationResult['warnings'];
  error?: CalculationResult['error'];
  isDownsampled?: CalculationResult['exceeded_server_limits'];
};

export type WorkflowState = WorkflowResult & {
  loading?: boolean;
  status?: StatusStatusEnum;
};
