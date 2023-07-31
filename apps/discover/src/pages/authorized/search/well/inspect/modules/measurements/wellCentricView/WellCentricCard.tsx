import { useNdsEventsForCasings } from 'domain/wells/nds/internal/hooks/useNdsEventsForCasings';
import { filterNdsByMeasuredDepth } from 'domain/wells/nds/internal/selectors/filterNdsByMeasuredDepth';
import { filterNdsBySelectedEvents } from 'domain/wells/nds/internal/selectors/filterNdsBySelectedEvents';
import { useNptEventsForCasings } from 'domain/wells/npt/internal/hooks/useNptEventsForCasings';
import { filterNptByMeasuredDepth } from 'domain/wells/npt/internal/selectors/filterNptByMeasuredDepth';
import { filterNptBySelectedEvents } from 'domain/wells/npt/internal/selectors/filterNptBySelectedEvents';
import { getWellboreTitle } from 'domain/wells/wellbore/internal/selectors/getWellboreTitle';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import head from 'lodash/head';
import uniqueBy from 'lodash/uniqBy';
import { v4 as uuid } from 'uuid';

import { Checkbox } from '@cognite/cogs.js';

import { BaseButton } from 'components/Buttons';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';
import { SegmentedControl } from 'components/SegmentedControl/SegmentedControl';
import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/selectors';
import {
  MeasurementChartData,
  MeasurementType,
  WellboreId,
} from 'modules/wellSearch/types';
import { ChartV2 } from 'pages/authorized/search/well/inspect/modules/common/ChartV2';
import CurveColorCode from 'pages/authorized/search/well/inspect/modules/common/ChartV2/CurveColorCode';

import { ChartProps } from '../../common/ChartV2/ChartV2';
import EventsByDepthForChart from '../../common/ChartV2/EventsByDepthForChart';
import { filterByChartType, filterByMainChartType } from '../utils';

import { EventTabs } from './constants';
import {
  Content,
  CurveIndicator,
  Footer,
  Header,
  HeaderActions,
  HeaderSubTitle,
  HeaderTitle,
  HeaderTitleContainer,
  LegendsHolder,
  Wrapper,
} from './elements';

type AxisNames = {
  x: string;
  y: string;
  x2?: string;
};

export type Props = {
  wellbore: WellboreInternal;
  chartData: MeasurementChartData[];
  axisNames: AxisNames;
  selected: boolean;
  filters: {
    nptEvents: MultiSelectCategorizedOptionMap;
    ndsEvents: MultiSelectCategorizedOptionMap;
  };
  onToggle: (id: WellboreId) => void;
};

const LEGEND_HOLDER_SHOW_ALL_HEIGHT = 16;

const axisAutoRange: ChartProps['axisAutorange'] = {
  y: 'reversed',
};

export const WellCentricCard: React.FC<Props> = ({
  wellbore,
  chartData,
  axisNames,
  selected,
  filters,
  onToggle,
}) => {
  const scaleRef = useRef<HTMLElement | null>(null);

  const legendsHolderRef = React.useRef<HTMLDivElement>(null);

  const wellboreIds = useWellInspectSelectedWellboreIds();

  const [currentTab, setCurrentTab] = useState<EventTabs>(EventTabs.cluster);

  const [scaleGap, setScaleGap] = useState(50);
  const [scaleBlocks, setScaleBlocks] = useState<number[]>([]);

  const [showAll, setShowAll] = useState<boolean>(false);
  const [displayShowAllButton, setDisplayShowAllButton] =
    useState<boolean>(false);

  const [[minDepth, maxDepth], setDepthRange] = useState<[number, number]>([
    0, 10,
  ]);

  const fitChart = head(filterByChartType(chartData, [MeasurementType.FIT]));
  const lotChart = head(filterByChartType(chartData, [MeasurementType.LOT]));

  const { isLoading: isNptLoading, data: nptEvents } = useNptEventsForCasings({
    wellboreIds,
  });
  const validNptEvents = useMemo(() => {
    const eventsByDepth = filterNptByMeasuredDepth(
      nptEvents[wellbore.id],
      minDepth,
      maxDepth
    );

    const eventsByFilter = filterNptBySelectedEvents(
      eventsByDepth,
      filters.nptEvents
    );

    return eventsByFilter;
  }, [nptEvents, wellbore.id, minDepth, maxDepth, filters.nptEvents]);

  const { isLoading: isNdsLoading, data: ndsEvents } = useNdsEventsForCasings({
    wellboreIds,
  });
  const validNdsEvents = useMemo(() => {
    const eventsByDepth = filterNdsByMeasuredDepth(
      ndsEvents[wellbore.id],
      minDepth,
      maxDepth
    );

    const eventsByFilter = filterNdsBySelectedEvents(
      eventsByDepth,
      filters.ndsEvents
    );

    return eventsByFilter;
  }, [minDepth, maxDepth, ndsEvents, filters.ndsEvents]);

  useEffect(() => {
    setDisplayShowAllButton(
      (legendsHolderRef?.current?.scrollHeight || 0) >
        LEGEND_HOLDER_SHOW_ALL_HEIGHT
    );
  }, [legendsHolderRef]);

  const wellboreName = wellbore.name;

  return (
    <Wrapper>
      <Header>
        <HeaderTitleContainer>
          <Checkbox
            checked={selected}
            onChange={() => onToggle(wellbore.id)}
            name={`wellcentric-card-${wellbore.id}`}
          >
            <div>
              <HeaderTitle data-testid="wellbore-descriptor">
                {getWellboreTitle(wellbore)}
              </HeaderTitle>
              <HeaderSubTitle>{wellbore.name}</HeaderSubTitle>
            </div>
          </Checkbox>
          <HeaderActions>
            <SegmentedControl
              onTabChange={(tabKey) => setCurrentTab(tabKey as any)}
              currentTab={currentTab}
              tabs={{
                [EventTabs.cluster]: 'Cluster view',
                [EventTabs.scatter]: 'Scatter view',
              }}
            />
          </HeaderActions>
        </HeaderTitleContainer>
      </Header>

      <Content>
        <ChartV2
          data={chartData}
          axisNames={axisNames}
          axisAutorange={axisAutoRange}
          adaptiveChart
          height={600}
          title="Geomechanics & PPFG"
          autosize
          ref={scaleRef}
          onMinMaxChange={(minY, maxY) => setDepthRange([minY, maxY])}
          onLayoutChange={(gap, lines) => {
            setScaleGap(gap);
            setScaleBlocks(lines);
          }}
        />

        <EventsByDepthForChart
          ndsEvents={validNdsEvents}
          nptEvents={validNptEvents}
          isNdsEventsLoading={isNdsLoading}
          isNptEventsLoading={isNptLoading}
          scaleBlocks={scaleBlocks}
          scaleLineGap={scaleGap}
          view={currentTab}
        />
      </Content>

      <Footer width={scaleRef.current?.clientWidth}>
        <LegendsHolder expanded={showAll} ref={legendsHolderRef}>
          {uniqueBy(filterByMainChartType(chartData), (row) => {
            const [curveDisplayName] = row.customdata as string[];
            return curveDisplayName || '';
          }).map((row) => {
            const [curveDisplayName] = row.customdata as string[];
            return (
              <CurveIndicator
                key={`${wellboreName}-${curveDisplayName}-${uuid()}`}
              >
                <CurveColorCode line={row.line} marker={row.marker} />
                <span>{curveDisplayName}</span>
              </CurveIndicator>
            );
          })}

          {fitChart && (
            <CurveIndicator key={`${wellboreName}-FIT`}>
              <CurveColorCode line={fitChart.line} marker={fitChart.marker} />
              <span>FIT</span>
            </CurveIndicator>
          )}

          {lotChart && (
            <CurveIndicator key={`${wellboreName}-LOT`}>
              <CurveColorCode line={lotChart.line} marker={lotChart.marker} />
              <span>LOT</span>
            </CurveIndicator>
          )}
        </LegendsHolder>

        <BaseButton
          hidden={!displayShowAllButton}
          type="ghost"
          size="small"
          icon={showAll ? 'ChevronUp' : 'ChevronDown'}
          text={showAll ? 'Hide all' : 'Show all'}
          aria-label={showAll ? 'Hide all' : 'Show all'}
          onClick={() => setShowAll(!showAll)}
        />
      </Footer>
    </Wrapper>
  );
};

export default WellCentricCard;
