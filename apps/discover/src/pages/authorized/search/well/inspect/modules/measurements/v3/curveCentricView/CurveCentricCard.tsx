import React from 'react';

import head from 'lodash/head';
import isUndefined from 'lodash/isUndefined';

import { NoDataAvailable } from 'components/charts/common/NoDataAvailable';
import {
  MeasurementChartDataV3 as MeasurementChartData,
  MeasurementTypeV3 as MeasurementType,
} from 'modules/wellSearch/types';
import { ChartV2 } from 'pages/authorized/search/well/inspect/modules/common/ChartV2';

import { SubHeader, Wrapper } from './elements';

type AxisNames = {
  x: string;
  y: string;
  x2?: string;
};

type Props = {
  chartData: MeasurementChartData[];
  axisNames: AxisNames;
};

export const CurveCentricCard: React.FC<Props> = ({ chartData, axisNames }) => {
  const chartDataItem = head(chartData);
  if (isUndefined(chartDataItem)) return <NoDataAvailable />;
  const { measurementType } = chartData[0];
  const isOtherType =
    measurementType === MeasurementType.FIT ||
    measurementType === MeasurementType.LOT;

  return (
    <Wrapper>
      {!isOtherType && (
        <SubHeader>
          {measurementType === MeasurementType.GEOMECHANNICS
            ? 'Geomechanics'
            : 'PPFG'}
        </SubHeader>
      )}
      <ChartV2
        data={chartData}
        axisNames={axisNames}
        axisAutorange={{
          y: 'reversed',
        }}
        title={
          isOtherType ? measurementType.toUpperCase() : chartData[0].name || ''
        }
        autosize
      />
    </Wrapper>
  );
};

export default CurveCentricCard;
