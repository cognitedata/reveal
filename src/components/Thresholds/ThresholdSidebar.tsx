/**
 * Threshold
 */

import { Button, Tooltip } from '@cognite/cogs.js';
import { FunctionComponent, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTranslations } from 'hooks/translations';
import {
  Chart,
  ChartThreshold,
  ChartThresholdEventFilter,
  ChartTimeSeries,
  ChartWorkflow,
} from 'models/chart/types';
import {
  addChartThreshold,
  initializeThresholdCollections,
  removeChartThreshold,
  updateChartThresholdName,
  updateChartThresholdSelectedSource,
  updateChartThresholdType,
  updateChartThresholdLowerLimit,
  updateChartThresholdUpperLimit,
  updateChartThresholdVisibility,
  updateChartThresholdEventFilters,
} from 'models/chart/updates';
import Thresholds from 'components/Thresholds/Thresholds';
import {
  Sidebar,
  TopContainer,
  TopContainerAside,
  TopContainerTitle,
  ContentOverflowWrapper,
} from 'components/Common/SidebarElements';

type OptionType = {
  value: string;
  label: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  chart: Chart;
  updateChart: (update: (c: Chart | undefined) => Chart) => void;
};

const ThresholdSidebar: FunctionComponent<Props> = ({
  visible,
  onClose,
  chart,
  updateChart,
}: Props) => {
  const { t } = useTranslations(Thresholds.translationKeys, 'ThresholdSidebar');

  const availableSources = useMemo(() => {
    return (chart.sourceCollection ?? [])
      .map((x) =>
        x.type === 'timeseries'
          ? {
              type: 'timeseries',
              ...chart?.timeSeriesCollection?.find((ts) => ts.id === x.id),
            }
          : {
              type: 'workflow',
              ...chart?.workflowCollection?.find((flow) => flow.id === x.id),
            }
      )
      .filter(Boolean) as (ChartTimeSeries | ChartWorkflow)[];
  }, [
    chart.sourceCollection,
    chart.timeSeriesCollection,
    chart.workflowCollection,
  ]);

  const handleAddThreshold = () => {
    const thresholdCount = chart.thresholdCollection?.length || 0;
    const emptyThreshold: ChartThreshold = {
      id: uuidv4(),
      name: `New threshold ${thresholdCount > 1 ? thresholdCount : ''}`,
      type: 'under',
      visible: true,
      filter: {
        minUnit: 'seconds',
        maxUnit: 'hours',
      },
    };
    updateChart((oldChart) => addChartThreshold(oldChart!, emptyThreshold));
  };

  const handleRemoveThreshold = (id: string) => {
    updateChart((oldChart) => removeChartThreshold(oldChart!, id));
  };

  const handleUpdateThresholdName = (id: string, name: string) => {
    updateChart((oldChart) => updateChartThresholdName(oldChart!, id, name));
  };

  const handleToggleThreshold = (id: string, visibility: boolean) => {
    updateChart((oldChart) =>
      updateChartThresholdVisibility(oldChart!, id, visibility)
    );
  };

  const handleChangeSelectedSource = (id: string, source: OptionType) => {
    updateChart((oldChart) =>
      updateChartThresholdSelectedSource(oldChart!, id, source.value)
    );
  };

  const handleChangeType = (id: string, value: ChartThreshold['type']) => {
    updateChart((oldChart) => updateChartThresholdType(oldChart!, id, value));
  };

  const handleChangeLowerLimit = (id: string, value: string) => {
    const lowerLimit = value;
    updateChart((oldChart) =>
      updateChartThresholdLowerLimit(oldChart!, id, parseFloat(lowerLimit))
    );
  };
  const handleChangeUpperLimit = (id: string, value: string) => {
    const upperLimit = value;
    updateChart((oldChart) =>
      updateChartThresholdUpperLimit(oldChart!, id, parseFloat(upperLimit))
    );
  };

  const handleChangeEventFilter = (
    id: string,
    filterOptions: ChartThresholdEventFilter
  ) => {
    updateChart((oldChart) =>
      updateChartThresholdEventFilters(oldChart!, id, filterOptions)
    );
  };

  useEffect(() => {
    if (!chart.thresholdCollection || chart.thresholdCollection === undefined) {
      updateChart((oldChart) => initializeThresholdCollections(oldChart!));
    }
  }, [chart, updateChart]);

  return (
    <Sidebar visible={visible}>
      <TopContainer>
        <TopContainerTitle>{t.Thresholds}</TopContainerTitle>
        <TopContainerAside>
          <Tooltip content={t.Hide}>
            <Button
              icon="Close"
              type="ghost"
              onClick={onClose}
              aria-label="Close"
            />
          </Tooltip>
        </TopContainerAside>
      </TopContainer>
      <ContentOverflowWrapper>
        <Thresholds
          thresholds={chart.thresholdCollection || []}
          sources={availableSources}
          onRemoveThreshold={handleRemoveThreshold}
          onToggleThreshold={handleToggleThreshold}
          onLowerLimitChange={handleChangeLowerLimit}
          onUpperLimitChange={handleChangeUpperLimit}
          onEventFilterChange={handleChangeEventFilter}
          onUpdateThresholdName={handleUpdateThresholdName}
          onSelectSource={handleChangeSelectedSource}
          onTypeChange={handleChangeType}
          onAddThreshold={handleAddThreshold}
          translations={t}
        />
      </ContentOverflowWrapper>
    </Sidebar>
  );
};

export default ThresholdSidebar;
