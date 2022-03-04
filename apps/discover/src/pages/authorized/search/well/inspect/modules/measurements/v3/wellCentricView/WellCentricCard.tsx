import React, { useEffect, useState } from 'react';

import head from 'lodash/head';
import uniqueBy from 'lodash/uniqBy';
import { v4 as uuid } from 'uuid';

import { Checkbox } from '@cognite/cogs.js';

import { BaseButton } from 'components/buttons';
import {
  MeasurementChartDataV3 as MeasurementChartData,
  MeasurementTypeV3,
  Wellbore,
  WellboreId,
} from 'modules/wellSearch/types';
import { ChartV2 } from 'pages/authorized/search/well/inspect/modules/common/ChartV2';
import CurveColorCode from 'pages/authorized/search/well/inspect/modules/common/ChartV2/CurveColorCode';

import { filterByChartType, filterByMainChartType } from '../utils';

import {
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
  const [showAll, setShowAll] = useState<boolean>(false);
  const legendsHolderRef = React.useRef<HTMLDivElement>(null);
  const [displayShowAllButton, setDisplayShowAllButton] =
    useState<boolean>(false);
  const fitChart = head(filterByChartType(chartData, [MeasurementTypeV3.FIT]));
  const lotChart = head(filterByChartType(chartData, [MeasurementTypeV3.LOT]));

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
              <HeaderTitle>{wellbore.metadata?.wellName}</HeaderTitle>
              <HeaderSubTitle data-testid="wellbore-descriptor">
                {wellbore.description} {wellbore.name}
              </HeaderSubTitle>
            </div>
          </Checkbox>
        </HeaderTitleContainer>
      </Header>
      <ChartV2
        data={chartData}
        axisNames={axisNames}
        axisAutorange={{
          y: 'reversed',
        }}
        title="Internal Friction Angle & Pore Pressure Fracture Gradient"
        autosize
      />
      <Footer>
        <LegendsHolder expanded={showAll} ref={legendsHolderRef}>
          {uniqueBy(filterByMainChartType(chartData), (row) => {
            const [curveDisplayName] = row.customdata as string[];
            return curveDisplayName || '';
          }).map((row) => {
            const [curveDisplayName] = row.customdata as string[];
            return (
              <CurveIndicator
                key={`${wellbore.description}-${curveDisplayName}-${uuid()}`}
              >
                <CurveColorCode line={row.line} marker={row.marker} />
                <span>{curveDisplayName}</span>
              </CurveIndicator>
            );
          })}

          {fitChart && (
            <CurveIndicator key={`${wellbore.description}-FIT`}>
              <CurveColorCode line={fitChart.line} marker={fitChart.marker} />
              <span>FIT</span>
            </CurveIndicator>
          )}

          {lotChart && (
            <CurveIndicator key={`${wellbore.description}-LOT`}>
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
