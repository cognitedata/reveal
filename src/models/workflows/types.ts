import { DoubleDatapoint } from '@cognite/sdk';

export type WorkflowResult = {
  id: string;
  loading: boolean;
  datapoints: DoubleDatapoint[];
};
