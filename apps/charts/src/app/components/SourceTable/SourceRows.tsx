import { memo, ComponentProps } from 'react';
import { Draggable } from 'react-beautiful-dnd';

import { useTranslations } from '@charts-app/hooks/translations';

import { ChartTimeSeries, ChartWorkflow } from '@cognite/charts-lib';

import { ScheduledCalculationRow } from './ScheduledCalculationRow';
import TimeSeriesRow from './TimeSeriesRow';
import { SourceRowsProps } from './types';
import WorkflowRow from './WorkflowRow';

const SourceRows = memo(
  ({
    sources = [],
    summaries,
    mode,
    selectedSourceId,
    openNodeEditor = () => {},
    timeseriesData = [],
    calculationData = [],
    scheduledCalculationsData = {},
    onRowClick = () => {},
    onInfoClick = () => {},
    onErrorIconClick = () => {},
    onOverrideUnitClick = () => () => {},
    onConversionUnitClick = () => () => {},
    onResetUnitClick = () => () => {},
    onCustomUnitLabelClick = () => () => {},
    onStatusIconClick = () => () => {},
    onRemoveSourceClick = () => () => {},
    onUpdateAppearance = () => () => {},
    onUpdateName = () => () => {},
    onDuplicateCalculation = () => () => {},
    draggable = false,
  }: SourceRowsProps) => {
    const isWorkspaceMode = mode === 'workspace';
    const isEditorMode = mode === 'editor';
    const isFileViewerMode = mode === 'file';

    const { t: translations } = useTranslations(
      [
        ...TimeSeriesRow.translationKeys,
        ...WorkflowRow.translationKeys,
        ...ScheduledCalculationRow.translationKeys,
      ],
      'SourceTableRow'
    );

    return (
      <>
        {sources.map((src, index) => (
          <Draggable key={src.id} draggableId={src.id} index={index}>
            {(draggableProvided) => {
              switch (src.type) {
                case 'timeseries':
                  return (
                    <TimeSeriesRow
                      key={src.id}
                      summary={
                        summaries[(src as ChartTimeSeries).tsExternalId || '']
                      }
                      provided={draggableProvided}
                      draggable={draggable}
                      timeseries={src as ChartTimeSeries}
                      isWorkspaceMode={isWorkspaceMode}
                      onRowClick={onRowClick}
                      onInfoClick={onInfoClick}
                      isSelected={selectedSourceId === src.id}
                      disabled={isEditorMode}
                      isFileViewerMode={isFileViewerMode}
                      translations={translations}
                      timeseriesResult={timeseriesData.find(
                        ({ externalId }) =>
                          externalId === (src as ChartTimeSeries).tsExternalId
                      )}
                      onOverrideUnitClick={onOverrideUnitClick(src)}
                      onConversionUnitClick={onConversionUnitClick(src)}
                      onResetUnitClick={onResetUnitClick(src)}
                      onCustomUnitLabelClick={onCustomUnitLabelClick(src)}
                      onStatusIconClick={onStatusIconClick(src)}
                      onRemoveSourceClick={onRemoveSourceClick(src)}
                      onUpdateAppearance={
                        onUpdateAppearance(src) as ComponentProps<
                          typeof TimeSeriesRow
                        >['onUpdateAppearance']
                      }
                      onUpdateName={onUpdateName(src)}
                    />
                  );
                case 'workflow':
                  return (
                    <WorkflowRow
                      key={src.id}
                      summary={summaries[src.id]}
                      provided={draggableProvided}
                      draggable={draggable}
                      workflow={src as ChartWorkflow}
                      isSelected={selectedSourceId === src.id}
                      onRowClick={onRowClick}
                      onInfoClick={onInfoClick}
                      onErrorIconClick={onErrorIconClick}
                      mode={mode}
                      openNodeEditor={openNodeEditor}
                      translations={translations}
                      calculationResult={calculationData.find(
                        ({ id }) => id === src.id
                      )}
                      onOverrideUnitClick={onOverrideUnitClick(src)}
                      onConversionUnitClick={onConversionUnitClick(src)}
                      onResetUnitClick={onResetUnitClick(src)}
                      onCustomUnitLabelClick={onCustomUnitLabelClick(src)}
                      onStatusIconClick={onStatusIconClick(src)}
                      onRemoveSourceClick={onRemoveSourceClick(src)}
                      onUpdateAppearance={
                        onUpdateAppearance(src) as ComponentProps<
                          typeof WorkflowRow
                        >['onUpdateAppearance']
                      }
                      onUpdateName={onUpdateName(src)}
                      onDuplicateCalculation={onDuplicateCalculation(src)}
                    />
                  );
                case 'scheduledCalculation':
                  return (
                    <ScheduledCalculationRow
                      key={src.id}
                      summary={summaries[src.id]}
                      provided={draggableProvided}
                      draggable={draggable}
                      scheduledCalculation={src}
                      isSelected={selectedSourceId === src.id}
                      onRowClick={onRowClick}
                      onInfoClick={onInfoClick}
                      onErrorIconClick={onErrorIconClick}
                      mode={mode}
                      openNodeEditor={openNodeEditor}
                      translations={translations}
                      scheduledCalculationResult={
                        scheduledCalculationsData[src.id]
                      }
                      onOverrideUnitClick={onOverrideUnitClick(src)}
                      onConversionUnitClick={onConversionUnitClick(src)}
                      onResetUnitClick={onResetUnitClick(src)}
                      onCustomUnitLabelClick={onCustomUnitLabelClick(src)}
                      onStatusIconClick={onStatusIconClick(src)}
                      onRemoveSourceClick={onRemoveSourceClick(src)}
                      onUpdateAppearance={
                        onUpdateAppearance(src) as ComponentProps<
                          typeof ScheduledCalculationRow
                        >['onUpdateAppearance']
                      }
                    />
                  );
                default:
                  return <div />;
              }
            }}
          </Draggable>
        ))}
      </>
    );
  }
);

export default SourceRows;
