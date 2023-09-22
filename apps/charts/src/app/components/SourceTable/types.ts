import { ComponentProps } from 'react';

import { WorkflowState } from '@charts-app/models/calculation-results/types';
import { ScheduledCalculationsDataMap } from '@charts-app/models/scheduled-calculation-results/types';
import { TimeseriesEntry } from '@charts-app/models/timeseries-results/types';

import {
  ChartTimeSeries,
  ChartWorkflow,
  ScheduledCalculation,
} from '@cognite/charts-lib';

import { ScheduledCalculationRow } from './ScheduledCalculationRow';
import TimeSeriesRow from './TimeSeriesRow';
import WorkflowRow from './WorkflowRow';

export type SourceRowsProps = {
  sources: (ChartTimeSeries | ChartWorkflow | ScheduledCalculation)[];
  summaries: {
    [key: string]: ComponentProps<
      typeof TimeSeriesRow | typeof WorkflowRow | typeof ScheduledCalculationRow
    >['summary'];
  };
  mode: string;
  openNodeEditor: () => void;
  selectedSourceId?: string;
  onRowClick: (id?: string) => void;
  onInfoClick: (id?: string) => void;
  onErrorIconClick?: (id: string) => void;
  draggable?: boolean;
  timeseriesData?: TimeseriesEntry[];
  calculationData?: WorkflowState[];
  scheduledCalculationsData?: ScheduledCalculationsDataMap;
  onOverrideUnitClick?: (
    source: ChartTimeSeries | ChartWorkflow | ScheduledCalculation
  ) => ComponentProps<
    typeof TimeSeriesRow | typeof WorkflowRow | typeof ScheduledCalculationRow
  >['onOverrideUnitClick'];
  onConversionUnitClick?: (
    source: ChartTimeSeries | ChartWorkflow | ScheduledCalculation
  ) => ComponentProps<
    typeof TimeSeriesRow | typeof WorkflowRow | typeof ScheduledCalculationRow
  >['onConversionUnitClick'];
  onResetUnitClick?: (
    source: ChartTimeSeries | ChartWorkflow | ScheduledCalculation
  ) => ComponentProps<
    typeof TimeSeriesRow | typeof WorkflowRow | typeof ScheduledCalculationRow
  >['onResetUnitClick'];
  onCustomUnitLabelClick?: (
    source: ChartTimeSeries | ChartWorkflow | ScheduledCalculation
  ) => ComponentProps<
    typeof TimeSeriesRow | typeof WorkflowRow | typeof ScheduledCalculationRow
  >['onCustomUnitLabelClick'];
  onStatusIconClick?: (
    source: ChartTimeSeries | ChartWorkflow | ScheduledCalculation
  ) => ComponentProps<
    typeof TimeSeriesRow | typeof WorkflowRow | typeof ScheduledCalculationRow
  >['onStatusIconClick'];
  onRemoveSourceClick?: (
    source: ChartTimeSeries | ChartWorkflow | ScheduledCalculation
  ) => ComponentProps<
    typeof TimeSeriesRow | typeof WorkflowRow | typeof ScheduledCalculationRow
  >['onRemoveSourceClick'];
  onUpdateAppearance?: (
    source: ChartTimeSeries | ChartWorkflow | ScheduledCalculation
  ) => ComponentProps<
    typeof TimeSeriesRow | typeof WorkflowRow | typeof ScheduledCalculationRow
  >['onUpdateAppearance'];
  onUpdateName?: (
    source: ChartTimeSeries | ChartWorkflow
  ) => ComponentProps<
    typeof TimeSeriesRow | typeof WorkflowRow
  >['onUpdateName'];
  onDuplicateCalculation?: (
    source: ChartTimeSeries | ChartWorkflow
  ) => ComponentProps<typeof WorkflowRow>['onDuplicateCalculation'];
};
