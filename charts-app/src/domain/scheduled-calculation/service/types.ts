import { CogniteExternalId } from '@cognite/sdk';
import { ComputationStep } from '@cognite/calculation-backend';

export type CalculationTaskSchedule = {
  externalId: CogniteExternalId;
  name?: string;
  description?: string;
  period: number;
  offset?: number;
  graph: { granularity: string; steps: ComputationStep[] };
  targetTimeseriesExternalId: string;
  createdTime?: number;
};

export type CalculationTaskScheduledCreate = CalculationTaskSchedule & {
  nonce: string;
};
