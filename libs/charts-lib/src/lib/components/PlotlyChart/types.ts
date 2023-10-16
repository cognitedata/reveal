import {
  CalculationResult,
  StatusStatusEnum,
  ComputationStep,
} from '@cognite/calculation-backend';
import {
  DatapointAggregate,
  DatapointAggregates,
  DoubleDatapoint,
  DoubleDatapoints,
  StringDatapoints,
  CogniteEvent,
  CogniteExternalId,
} from '@cognite/sdk';

import { ChartEventFilters } from '../../types';

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

export type EventsEntry = {
  id: number;
};

export type EventsCollection = EventsEntry[];

export type ChartEventResults = ChartEventFilters & {
  results: CogniteEvent[] | undefined;
  isLoading?: boolean;
};

export type InteractionData = {
  highlightedTimeseriesId: string | undefined;
};

export type ScheduledCalculationTask = {
  externalId: CogniteExternalId;
  name?: string;
  description?: string;
  period: number;
  offset?: number;
  graph: { granularity: string; steps: ComputationStep[] };
  targetTimeseriesExternalId: string;
  createdTime?: number;
};

export type ScheduledCalculationTaskCreate = ScheduledCalculationTask & {
  nonce: string;
};

export type ScheduledCalculationData = ScheduledCalculationTask & {
  loading: boolean;
  series?: DatapointAggregates | StringDatapoints | DoubleDatapoints;
};

export type ScheduledCalculationsDataMap = {
  [taskId: string]: ScheduledCalculationData;
};

export type TimeseriesEntry = {
  externalId: string;
  loading: boolean;
  series?: DatapointAggregates | StringDatapoints | DoubleDatapoints;
};

export type TimeseriesCollection = TimeseriesEntry[];
