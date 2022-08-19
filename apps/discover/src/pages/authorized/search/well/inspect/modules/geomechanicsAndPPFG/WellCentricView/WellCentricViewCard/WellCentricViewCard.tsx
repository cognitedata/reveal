import { filterNdsByMeasuredDepth } from 'domain/wells/nds/internal/selectors/filterNdsByMeasuredDepth';
import { NdsInternal } from 'domain/wells/nds/internal/types';
import { filterNptByMeasuredDepth } from 'domain/wells/npt/internal/selectors/filterNptByMeasuredDepth';
import { NptInternal } from 'domain/wells/npt/internal/types';

import React, { useState } from 'react';

import { BooleanMap } from 'utils/booleanMap';

import { useDeepMemo } from 'hooks/useDeep';

import { NdsEventsColumnForChart } from '../../../common/ChartV2/NdsEventsColumnForChart';
import { NptEventsColumnForChart } from '../../../common/ChartV2/NptEventsColumnForChart';
import { EventsColumnView } from '../../../common/Events/types';
import { ChartLegend } from '../../components/ChartLegend';
import { MeasurementsView, MeasurementUnits } from '../../types';
import { adaptToChartDataWellCentricView } from '../../utils/adaptToChartDataWellCentricView';
import { filterChartDataBySelection } from '../../utils/filterChartDataBySelection';

import { ChartColumn } from './ChartColumn';
import {
  ChartLegendWrapper,
  ContentWrapper,
  WellCentricViewCardWrapper,
} from './elements';
import { Header } from './Header';

export interface WellCentricViewCardProps {
  data: MeasurementsView;
  nptEvents: NptInternal[];
  ndsEvents: NdsInternal[];
  measurementUnits: MeasurementUnits;
  curveSelection: BooleanMap;
  isSelected: boolean;
  onSelectWellbore: (isSelected: boolean) => void;
}

export const WellCentricViewCard: React.FC<WellCentricViewCardProps> = ({
  data,
  nptEvents,
  ndsEvents,
  measurementUnits,
  curveSelection,
  isSelected,
  onSelectWellbore,
}) => {
  const { wellName, wellboreName, depthRange } = data;

  const [eventsColumnView, setEventsColumnView] = useState(
    EventsColumnView.Cluster
  );
  const [[minDepth, maxDepth], setDepthRange] = useState<[number, number]>([
    depthRange?.min || 0,
    depthRange?.max || 0,
  ]);
  const [scaleBlockHeight, setScaleBlockHeight] = useState(50);
  const [scaleBlocks, setScaleBlocks] = useState<number[]>([]);

  const chartData = useDeepMemo(
    () => adaptToChartDataWellCentricView(data, measurementUnits),
    [data, measurementUnits]
  );

  const chartDataSelected = useDeepMemo(
    () => filterChartDataBySelection(chartData, curveSelection),
    [chartData, curveSelection]
  );

  const nptColumnData = useDeepMemo(
    () => filterNptByMeasuredDepth(nptEvents, minDepth, maxDepth),
    [nptEvents, minDepth, maxDepth]
  );

  const ndsColumnData = useDeepMemo(
    () => filterNdsByMeasuredDepth(ndsEvents, minDepth, maxDepth),
    [nptEvents, minDepth, maxDepth]
  );

  const handleLayoutChange = (
    scaleBlockHeight: number,
    scaleBlocks: number[]
  ) => {
    setScaleBlockHeight(scaleBlockHeight);
    setScaleBlocks(scaleBlocks);
  };

  return (
    <WellCentricViewCardWrapper data-testid="well-centric-view-card">
      <Header
        wellName={wellName}
        wellboreName={wellboreName}
        isSelected={isSelected}
        onChangeCheckbox={onSelectWellbore}
        onChangeEventsColumnView={setEventsColumnView}
      />

      <ContentWrapper>
        <ChartColumn
          data={chartDataSelected}
          measurementUnits={measurementUnits}
          onMinMaxChange={setDepthRange}
          onLayoutChange={handleLayoutChange}
        />

        <NptEventsColumnForChart
          scaleBlocks={scaleBlocks}
          events={nptColumnData}
          scaleLineGap={scaleBlockHeight}
          view={eventsColumnView}
        />

        <NdsEventsColumnForChart
          scaleBlocks={scaleBlocks}
          events={ndsColumnData}
          scaleLineGap={scaleBlockHeight}
          view={eventsColumnView}
        />
      </ContentWrapper>

      <ChartLegendWrapper>
        <ChartLegend data={chartDataSelected} />
      </ChartLegendWrapper>
    </WellCentricViewCardWrapper>
  );
};
