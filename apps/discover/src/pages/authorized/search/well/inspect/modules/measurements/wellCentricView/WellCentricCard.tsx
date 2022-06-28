import { useNdsEventsForCasings } from 'domain/wells/nds/internal/hooks/useNdsEventsForCasings';
import { filterNdsByMeasuredDepth } from 'domain/wells/nds/internal/selectors/filterNdsByMeasuredDepth';
import { useNptEventsForCasings } from 'domain/wells/npt/internal/hooks/useNptEventsForCasings';
import { filterNptByMeasuredDepth } from 'domain/wells/npt/internal/selectors/filterNptByMeasuredDepth';
import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellboreIds';
import { getWellboreName } from 'domain/wells/wellbore/internal/selectors/getWellboreName';
import { getWellboreTitle } from 'domain/wells/wellbore/internal/selectors/getWellboreTitle';
import { Wellbore } from 'domain/wells/wellbore/internal/types';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import head from 'lodash/head';
import uniqueBy from 'lodash/uniqBy';
import { v4 as uuid } from 'uuid';

import { Checkbox, SegmentedControl } from '@cognite/cogs.js';

import { BaseButton } from 'components/Buttons';
import {
  MeasurementChartDataV3 as MeasurementChartData,
  MeasurementTypeV3,
  WellboreId,
} from 'modules/wellSearch/types';
import { ChartV2 } from 'pages/authorized/search/well/inspect/modules/common/ChartV2';
import CurveColorCode from 'pages/authorized/search/well/inspect/modules/common/ChartV2/CurveColorCode';

import EventsByDepth from '../../common/Events/EventsByDepth';
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
  wellbore: Wellbore;
  chartData: MeasurementChartData[];
  axisNames: AxisNames;
  selected: boolean;
  onToggle: (id: WellboreId) => void;
};

const LEGEND_HOLDER_SHOW_ALL_HEIGHT = 16;

export const WellCentricCard: React.FC<Props> = ({
  wellbore,
  chartData,
  axisNames,
  selected,
  onToggle,
}) => {
  const scaleRef = useRef<HTMLElement | null>(null);
  const legendsHolderRef = React.useRef<HTMLDivElement>(null);

  const wellboreIds = useWellInspectSelectedWellboreIds();

  const [currentTab, setCurrentTab] = useState<EventTabs>(EventTabs.scatter);

  const [scaleGap, setScaleGap] = useState(50);
  const [scaleBlocks, setScaleBlocks] = useState<number[]>([]);

  const [showAll, setShowAll] = useState<boolean>(false);
  const [displayShowAllButton, setDisplayShowAllButton] =
    useState<boolean>(false);

  const [[minDepth, maxDepth], setDepthRange] = useState<[number, number]>([
    0, 10,
  ]);

  const fitChart = head(filterByChartType(chartData, [MeasurementTypeV3.FIT]));
  const lotChart = head(filterByChartType(chartData, [MeasurementTypeV3.LOT]));

  const { isLoading: isNptLoading, data: nptEvents } = useNptEventsForCasings({
    wellboreIds,
  });
  const validNptEvents = useMemo(
    () => filterNptByMeasuredDepth(nptEvents[wellbore.id], minDepth, maxDepth),
    [nptEvents, wellbore.id, minDepth, maxDepth]
  );

  const { isLoading: isNdsLoading, data: ndsEvents } = useNdsEventsForCasings({
    wellboreIds,
  });
  const validNdsEvents = useMemo(
    () => filterNdsByMeasuredDepth(ndsEvents[wellbore.id], minDepth, maxDepth),
    [minDepth, maxDepth, ndsEvents]
  );

  useEffect(() => {
    setDisplayShowAllButton(
      (legendsHolderRef?.current?.scrollHeight || 0) >
        LEGEND_HOLDER_SHOW_ALL_HEIGHT
    );
  }, [legendsHolderRef]);

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
              currentKey={currentTab}
              onButtonClicked={(tabKey: string) => setCurrentTab(tabKey as any)}
            >
              <SegmentedControl.Button key={EventTabs.cluster}>
                Cluster view
              </SegmentedControl.Button>
              <SegmentedControl.Button key={EventTabs.scatter}>
                Scatter view
              </SegmentedControl.Button>
            </SegmentedControl>
          </HeaderActions>
        </HeaderTitleContainer>
      </Header>

      <Content>
        <ChartV2
          data={chartData}
          axisNames={axisNames}
          axisAutorange={{
            y: 'reversed',
          }}
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

        <EventsByDepth
          ndsEvents={validNdsEvents}
          nptEvents={validNptEvents}
          isNdsEventsLoading={isNdsLoading}
          isNptEventsLoading={isNptLoading}
          scaleBlocks={scaleBlocks}
          scaleLineGap={scaleGap}
          view={currentTab}
        />
      </Content>

      <Footer>
        <LegendsHolder expanded={showAll} ref={legendsHolderRef}>
          {uniqueBy(filterByMainChartType(chartData), (row) => {
            const [curveDisplayName] = row.customdata as string[];
            return curveDisplayName || '';
          }).map((row) => {
            const [curveDisplayName] = row.customdata as string[];
            return (
              <CurveIndicator
                key={`${getWellboreName(
                  wellbore
                )}-${curveDisplayName}-${uuid()}`}
              >
                <CurveColorCode line={row.line} marker={row.marker} />
                <span>{curveDisplayName}</span>
              </CurveIndicator>
            );
          })}

          {fitChart && (
            <CurveIndicator key={`${getWellboreName(wellbore)}-FIT`}>
              <CurveColorCode line={fitChart.line} marker={fitChart.marker} />
              <span>FIT</span>
            </CurveIndicator>
          )}

          {lotChart && (
            <CurveIndicator key={`${getWellboreName(wellbore)}-LOT`}>
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
