import React, { useState } from 'react';

import { BaseButton } from 'components/buttons';
import {
  MeasurementChartData,
  MeasurementType,
  Wellbore,
} from 'modules/wellSearch/types';

import { ChartV2 } from '../../common/ChartV2';
import CurveColorCode from '../../common/ChartV2/CurveColorCode';
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

type Props = {
  wellbore: Wellbore;
  chartData: MeasurementChartData[];
  axisNames: AxisNames;
};

export const WellCentricCard: React.FC<Props> = ({
  wellbore,
  chartData,
  axisNames,
}) => {
  const [showAll, setShowAll] = useState<boolean>(false);
  const legendsHolderRef = React.useRef<HTMLDivElement>(null);
  const displayShowAll = (legendsHolderRef?.current?.scrollHeight || 0) > 16;
  const fitChart = filterByChartType(chartData, [MeasurementType.fit])[0];
  const lotChart = filterByChartType(chartData, [MeasurementType.lot])[0];

  return (
    <Wrapper>
      <Header>
        <HeaderTitleContainer>
          <HeaderTitle>{wellbore.metadata?.wellName}</HeaderTitle>
          <HeaderSubTitle>
            {wellbore.description} {wellbore.name}
          </HeaderSubTitle>
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
          {filterByMainChartType(chartData).map((row) => {
            const customdata = row.customdata as string[];
            return (
              <CurveIndicator key={`${wellbore.description}-${customdata[0]}`}>
                <CurveColorCode line={row.line} marker={row.marker} />
                <span>{customdata[0]}</span>
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
          hidden={!displayShowAll}
          type="ghost"
          size="small"
          icon={showAll ? 'ChevronUpCompact' : 'ChevronDownCompact'}
          text={showAll ? 'Hide all' : 'Show all'}
          aria-label={showAll ? 'Hide all' : 'Show all'}
          onClick={() => setShowAll(!showAll)}
        />
      </Footer>
    </Wrapper>
  );
};

export default WellCentricCard;
