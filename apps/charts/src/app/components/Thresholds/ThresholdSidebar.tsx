/**
 * Threshold
 */

import { FunctionComponent, useEffect } from 'react';

import {
  Sidebar,
  TopContainer,
  TopContainerAside,
  TopContainerTitle,
  ContentOverflowWrapper,
} from '@charts-app/components/Common/SidebarElements';
import Thresholds from '@charts-app/components/Thresholds/Thresholds';
import useThresholdsResults from '@charts-app/hooks/threshold-calculations';
import { useTranslations } from '@charts-app/hooks/translations';
import { useChartSourcesValue } from '@charts-app/models/chart/selectors';
import {
  Chart,
  ChartSource,
  ChartThreshold,
  ChartThresholdEventFilter,
} from '@charts-app/models/chart/types';
import {
  addChartThreshold,
  initThresholdCollection,
  removeChartThreshold,
  updateChartThresholdName,
  updateChartThresholdSelectedSource,
  updateChartThresholdType,
  updateChartThresholdLowerLimit,
  updateChartThresholdUpperLimit,
  updateChartThresholdVisibility,
  updateChartThresholdEventFilters,
} from '@charts-app/models/chart/updates-threshold';
import { omit } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { Button, Icon, Tooltip } from '@cognite/cogs.js';

type Props = {
  visible: boolean;
  onClose: () => void;
  chart: Chart;
  updateChart: (update: (c: Chart | undefined) => Chart) => void;
  _useThresholds?: typeof useThresholdsResults;
};

const ThresholdSidebar: FunctionComponent<Props> = ({
  visible,
  onClose,
  chart,
  updateChart,
  _useThresholds,
}: Props) => {
  const { t } = useTranslations(Thresholds.translationKeys, 'ThresholdSidebar');
  const sources = useChartSourcesValue();

  const handleAddThreshold = () => {
    const thresholdCount = chart.thresholdCollection?.length || 0;
    const emptyThreshold: ChartThreshold = {
      id: uuidv4(),
      name: `${t['New threshold']} ${thresholdCount + 1}`,
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

  const handleChangeSelectedSource = (id: string, source: ChartSource) => {
    updateChart((oldChart) =>
      updateChartThresholdSelectedSource(oldChart!, id, source.id)
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

  const handleDuplicateThreshold = (id: string) => {
    const selectedThreshold = chart.thresholdCollection?.find(
      (ths) => ths.id === id
    );
    if (!selectedThreshold) throw new Error('Threshold was not found');
    const clonedThreshold = {
      ...omit(selectedThreshold, ['name', 'id']),
      id: uuidv4(),
      name: `${selectedThreshold.name} (${t.Duplicate})`,
    };

    updateChart((oldChart) => addChartThreshold(oldChart!, clonedThreshold));
  };

  useEffect(() => {
    if (!chart.thresholdCollection || chart.thresholdCollection === undefined) {
      updateChart((oldChart) => initThresholdCollection(oldChart!));
    }
  }, [chart, updateChart]);

  return (
    <Sidebar visible={visible}>
      <TopContainer>
        <TopContainerTitle>
          <Icon type="Threshold" size={21} />
          {t.Thresholds}
        </TopContainerTitle>
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
          sources={sources}
          onRemoveThreshold={handleRemoveThreshold}
          onToggleThreshold={handleToggleThreshold}
          onDuplicateThreshold={handleDuplicateThreshold}
          onLowerLimitChange={handleChangeLowerLimit}
          onUpperLimitChange={handleChangeUpperLimit}
          onEventFilterChange={handleChangeEventFilter}
          onUpdateThresholdName={handleUpdateThresholdName}
          onSelectSource={handleChangeSelectedSource}
          onTypeChange={handleChangeType}
          onAddThreshold={handleAddThreshold}
          translations={t}
          _useThresholds={_useThresholds}
        />
      </ContentOverflowWrapper>
    </Sidebar>
  );
};

export default ThresholdSidebar;
