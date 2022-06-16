import { getWellboreName } from 'domain/wells/wellbore/internal/selectors/getWellboreName';
import { getWellboreTitle } from 'domain/wells/wellbore/internal/selectors/getWellboreTitle';
import { Wellbore } from 'domain/wells/wellbore/internal/types';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import head from 'lodash/head';
import uniqueBy from 'lodash/uniqBy';
import { v4 as uuid } from 'uuid';

import { Checkbox } from '@cognite/cogs.js';

import { BaseButton } from 'components/Buttons';
import {
  useNdsEventsForCasings,
  useNptEventsForCasings,
} from 'modules/wellSearch/selectors';
import {
  MeasurementChartDataV3 as MeasurementChartData,
  MeasurementTypeV3,
  WellboreId,
} from 'modules/wellSearch/types';
import { ChartV2 } from 'pages/authorized/search/well/inspect/modules/common/ChartV2';
import CurveColorCode from 'pages/authorized/search/well/inspect/modules/common/ChartV2/CurveColorCode';

import EventsByDepth from '../../common/Events/EventsByDepth';
import { filterNdsByDepth, filterNptByDepth } from '../../common/Events/utils';
import { filterByChartType, filterByMainChartType } from '../utils';

import {
  Content,
  CurveIndicator,
  Footer,
  Header,
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

  const [scaleGap, setScaleGap] = useState(50);
  const [scaleBlocks, setScaleBlocks] = useState<number[]>([]);

  const [showAll, setShowAll] = useState<boolean>(false);
  const [displayShowAllButton, setDisplayShowAllButton] =
    useState<boolean>(false);

  const [[minDepth, maxDepth], setDepthRange] = useState<[number, number]>([
    0, 0,
  ]);

  const fitChart = head(filterByChartType(chartData, [MeasurementTypeV3.FIT]));
  const lotChart = head(filterByChartType(chartData, [MeasurementTypeV3.LOT]));

  const { isLoading: isNptLoading, events } = useNptEventsForCasings();
  const validNptEvents = useMemo(
    () => filterNptByDepth(events[wellbore.id], minDepth, maxDepth),
    [events, wellbore.id, minDepth, maxDepth]
  );

  const { isLoading: isNdsLoading, events: ndsEvents } =
    useNdsEventsForCasings();
  const validNdsEvents = useMemo(
    () => filterNdsByDepth(ndsEvents[wellbore.id], minDepth, maxDepth),
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
