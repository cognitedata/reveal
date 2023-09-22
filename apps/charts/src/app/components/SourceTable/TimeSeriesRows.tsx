import { ComponentProps } from 'react';

import { ScheduledCalculationRow } from '@charts-app/components/SourceTable/ScheduledCalculationRow';
import WorkflowRow from '@charts-app/components/SourceTable/WorkflowRow';
import { useTranslations } from '@charts-app/hooks/translations';
import { Modes } from '@charts-app/pages/types';

import {
  ChartTimeSeries,
  ChartWorkflow,
  ScheduledCalculation,
} from '@cognite/charts-lib';

import TimeSeriesRow from './TimeSeriesRow';

type Props = {
  sources: ChartTimeSeries[];
  summaries: {
    [key: string]: ComponentProps<typeof TimeSeriesRow>['summary'];
  };
  mode: Modes;
  selectedSourceId?: string;
  onRowClick?: (id?: string) => void;
  onInfoClick?: (id?: string) => void;
  onRemoveSourceClick?: (
    source: ChartTimeSeries | ChartWorkflow | ScheduledCalculation
  ) => ComponentProps<
    typeof TimeSeriesRow | typeof WorkflowRow | typeof ScheduledCalculationRow
  >['onRemoveSourceClick'];
};
export default function TimeSeriesRows({
  sources = [],
  summaries,
  mode,
  onRowClick = () => {},
  onInfoClick = () => {},
  selectedSourceId,
  onRemoveSourceClick = () => () => {},
}: Props) {
  const isWorkspaceMode = mode === 'workspace';
  const isEditorMode = mode === 'editor';
  const isFileViewerMode = mode === 'file';

  const { t: translations } = useTranslations(
    TimeSeriesRow.translationKeys,
    'SourceTableRow'
  );

  return (
    <>
      {sources.map((t) => (
        <TimeSeriesRow
          key={t.id}
          timeseries={t}
          summary={summaries[t.tsExternalId || '']}
          isWorkspaceMode={isWorkspaceMode}
          onRowClick={onRowClick}
          onInfoClick={onInfoClick}
          isSelected={selectedSourceId === t.id}
          disabled={isEditorMode}
          isFileViewerMode={isFileViewerMode}
          translations={translations}
          onRemoveSourceClick={onRemoveSourceClick(t)}
        />
      ))}
    </>
  );
}
