import * as React from 'react';

import head from 'lodash/head';
import isUndefined from 'lodash/isUndefined';

import { NoDataAvailable } from 'components/Charts/common/NoDataAvailable';
import {
  MeasurementChartData,
  MeasurementType,
} from 'modules/wellSearch/types';
import { ChartV2 } from 'pages/authorized/search/well/inspect/modules/common/ChartV2';

import { ChartProps } from '../../common/ChartV2/ChartV2';

import { GEOMECHANICS_CRUVES_TITLE, PPFG_CURVES_TITLE } from './constants';
import { SubHeader, Wrapper } from './elements';

type AxisNames = {
  x: string;
  y: string;
  x2?: string;
};

export type Props = {
  chartData: MeasurementChartData[];
  axisNames: AxisNames;
  measurementType: MeasurementType;
};

const axisAutorange: ChartProps['axisAutorange'] = {
  y: 'reversed',
};

export const CurveCentricCard: React.FC<Props> = ({
  chartData,
  axisNames,
  measurementType,
}) => {
  const chartDataItem = head(chartData);
  if (isUndefined(chartDataItem)) {
    return <NoDataAvailable />;
  }
  const isOtherType =
    measurementType === MeasurementType.FIT ||
    measurementType === MeasurementType.LOT;

  return (
    <Wrapper>
      {!isOtherType && (
        <SubHeader data-testid="curve-centric-card-header">
          {measurementType === MeasurementType.GEOMECHANNICS
            ? GEOMECHANICS_CRUVES_TITLE
            : PPFG_CURVES_TITLE}
        </SubHeader>
      )}
      <ChartV2
        data={chartData}
        axisNames={axisNames}
        axisAutorange={axisAutorange}
        title={
          isOtherType ? measurementType.toUpperCase() : chartData[0].name || ''
        }
        autosize
      />
    </Wrapper>
  );
};

export default CurveCentricCard;
