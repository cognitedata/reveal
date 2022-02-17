import React from 'react';

import {
  MeasurementChartData,
  MeasurementType,
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
  const { measurementType } = chartData[0];
  const measurementTypeValue = MeasurementType[measurementType];
  const isOtherType =
    measurementType === MeasurementType.fit ||
    measurementType === MeasurementType.lot;

  return (
    <Wrapper>
      {!isOtherType && (
        <SubHeader>
          {measurementType === MeasurementType.geomechanic
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
          isOtherType
            ? measurementTypeValue.toUpperCase()
            : chartData[0].name || ''
        }
        autosize
      />
    </Wrapper>
  );
};

export default CurveCentricCard;
