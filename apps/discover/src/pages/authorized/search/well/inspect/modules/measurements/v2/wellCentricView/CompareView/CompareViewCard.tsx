import React, { useState } from 'react';

import { BaseButton } from 'components/buttons';
import {
  MeasurementChartData,
  MeasurementType,
} from 'modules/wellSearch/types';
import { ChartV2 } from 'pages/authorized/search/well/inspect/modules/common/ChartV2';
import CurveColorCode from 'pages/authorized/search/well/inspect/modules/common/ChartV2/CurveColorCode';
import { FlexColumn, FlexRow } from 'styles/layout';

import { filterByChartType, filterByMainChartType } from '../../utils';

import {
  CardWrapper,
  CurveName,
  Footer,
  LegendsHolder,
  WellboreName,
} from './elements';

type AxisNames = {
  x: string;
  y: string;
  x2?: string;
};

type Props = {
  title: string;
  chartData: MeasurementChartData[];
  axisNames: AxisNames;
};

const FOOTER_MIN_HEIGHT = 32;

export const CompareViewCard: React.FC<Props> = ({
  title,
  chartData,
  axisNames,
}) => {
  const [showAll, setShowAll] = useState<boolean>(false);
  const legendsHolderRef = React.useRef<HTMLDivElement>(null);
  const displayShowAll =
    (legendsHolderRef?.current?.scrollHeight || 0) > FOOTER_MIN_HEIGHT;
  const fitChart = filterByChartType(chartData, [MeasurementType.fit])[0];
  const lotChart = filterByChartType(chartData, [MeasurementType.lot])[0];

  return (
    <CardWrapper>
      <ChartV2
        data={chartData}
        axisNames={axisNames}
        axisAutorange={{
          y: 'reversed',
        }}
        title={title}
        autosize
      />
      <Footer>
        <LegendsHolder expanded={showAll} ref={legendsHolderRef}>
          {filterByMainChartType(chartData).map((row) => {
            const customdata = row.customdata as string[];
            return (
              <FlexRow key={`${customdata[0]}-${customdata[1]}`}>
                <CurveColorCode line={row.line} marker={row.marker} />
                <FlexColumn>
                  <CurveName>{customdata[0]}</CurveName>
                  <WellboreName>{customdata[1]}</WellboreName>
                </FlexColumn>
              </FlexRow>
            );
          })}

          {fitChart && fitChart.customdata && (
            <FlexRow key={`FIT-${fitChart.customdata[1]}`}>
              <CurveColorCode line={fitChart.line} marker={fitChart.marker} />
              <FlexColumn>
                <CurveName>FIT</CurveName>
                <WellboreName>{fitChart.customdata[1]}</WellboreName>
              </FlexColumn>
            </FlexRow>
          )}

          {lotChart && lotChart.customdata && (
            <FlexRow key={`LOT-${lotChart.customdata[1]}`}>
              <CurveColorCode line={lotChart.line} marker={lotChart.marker} />
              <FlexColumn>
                <CurveName>LOT</CurveName>
                <WellboreName>{lotChart.customdata[1]}</WellboreName>
              </FlexColumn>
            </FlexRow>
          )}
        </LegendsHolder>

        <BaseButton
          hidden={!displayShowAll}
          type="ghost"
          size="small"
          icon={showAll ? 'ChevronUp' : 'ChevronDown'}
          text={showAll ? 'Hide all' : 'Show all'}
          aria-label={showAll ? 'Hide all' : 'Show all'}
          onClick={() => setShowAll(!showAll)}
        />
      </Footer>
    </CardWrapper>
  );
};

export default CompareViewCard;
