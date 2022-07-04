import { useTranslations } from 'hooks/translations';
import { ChartTimeSeries } from 'models/charts/charts/types/types';
import { Modes } from 'pages/types';
import { ComponentProps } from 'react';
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
};
export default function TimeSeriesRows({
  sources = [],
  summaries,
  mode,
  onRowClick = () => {},
  onInfoClick = () => {},
  selectedSourceId,
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
        />
      ))}
    </>
  );
}
