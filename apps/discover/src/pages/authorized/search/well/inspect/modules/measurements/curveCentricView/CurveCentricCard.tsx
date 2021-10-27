import React from 'react';

import { MeasurementChartData } from 'modules/wellSearch/types';

import { ChartV2 } from '../../common/ChartV2';

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
  return (
    <Wrapper>
      <SubHeader>{chartData[0].measurementType || ''}</SubHeader>
      <ChartV2
        data={chartData}
        axisNames={axisNames}
        axisAutorange={{
          y: 'reversed',
        }}
        title={chartData[0].name || ''}
        autosize
      />
    </Wrapper>
  );
};

export default CurveCentricCard;
