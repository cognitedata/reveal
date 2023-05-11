import { CogniteExternalId } from '@cognite/sdk';
import { ComputationStep } from '@cognite/calculation-backend';

type ScheduledCalculationStep = Omit<ComputationStep, 'params'>;

export type CalculationTaskSchedule = {
  externalId: CogniteExternalId;
  name?: string;
  description?: string;
  period: number;
  offset?: number;
  graph: { granularity: string; steps: ScheduledCalculationStep[] };
  targetTimeseriesExternalId: string;
};

export type CalculationTaskScheduledCreate = CalculationTaskSchedule & {
  nonce: string;
};
