import { Chart } from 'reducers/charts/types';
import { Modes } from 'pages/types';
import TimeSeriesRow from './TimeSeriesRow';

type Props = {
  chart: Chart;
  updateChart: (update: (c: Chart | undefined) => Chart) => void;
  mode: Modes;
  selectedSourceId?: string;
  onRowClick?: (id?: string) => void;
  onInfoClick?: (id?: string) => void;
  dateFrom: string;
  dateTo: string;
};
export default function TimeSeriesRows({
  chart,
  updateChart,
  mode,
  onRowClick = () => {},
  onInfoClick = () => {},
  selectedSourceId,
  dateFrom,
  dateTo,
}: Props) {
  const isWorkspaceMode = mode === 'workspace';
  const isEditorMode = mode === 'editor';
  const isFileViewerMode = mode === 'file';

  return (
    <>
      {chart?.timeSeriesCollection?.map((t) => (
        <TimeSeriesRow
          key={t.id}
          mutate={updateChart}
          chart={chart}
          timeseries={t}
          isWorkspaceMode={isWorkspaceMode}
          onRowClick={onRowClick}
          onInfoClick={onInfoClick}
          isSelected={selectedSourceId === t.id}
          disabled={isEditorMode}
          isFileViewerMode={isFileViewerMode}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />
      ))}
    </>
  );
}
