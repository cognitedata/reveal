import { ComponentProps } from 'react';

import {
  ChartTimeSeries,
  ChartWorkflow,
  ScheduledCalculation,
} from '@cognite/charts-lib';

import { WorkflowState } from '../../models/calculation-results/types';
import { ScheduledCalculationsDataMap } from '../../models/scheduled-calculation-results/types';
import { TimeseriesEntry } from '../../models/timeseries-results/types';

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
