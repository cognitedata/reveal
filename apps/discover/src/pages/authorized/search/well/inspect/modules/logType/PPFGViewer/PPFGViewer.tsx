import React from 'react';
import { useTranslation } from 'react-i18next';

import get from 'lodash/get';

import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { SequenceData } from 'modules/wellSearch/types';
import { convertToPlotly } from 'modules/wellSearch/utils/ppfg';

import { EMPTY_CHART_DATA_MESSAGE } from '../../../constants';
import Chart from '../../common/Chart/Chart';
import { MessageWrapper } from '../../common/elements';

import { ChartHolder } from './elements';

type Props = {
  ppfgData: SequenceData;
};

const DISPLAY_CURVES = [
  'FP_COMPOSITE_HIGH',
  'FP_COMPOSITE_LOW',
  'FP_COMPOSITE_ML',
  'PNORM',
  // 'PP_COMPOSITE_HIGH', Hide due to negative values
  // 'PP_COMPOSITE_LOW', Hide due to negative values
  // 'PP_COMPOSITE_ML', Hide due to negative values
  'SVERTICAL',
];

export const PPFGViewer: React.FC<Props> = ({ ppfgData }) => {
  const { t } = useTranslation('WellData');
  const { data: config } = useWellConfig();

  const tvdColumn = get(config, 'ppfg.tvdColumn', 'TVD');

  const ppfgChartData = convertToPlotly([ppfgData], DISPLAY_CURVES, tvdColumn);

  return ppfgChartData && ppfgChartData.chartData.length > 0 ? (
    <ChartHolder>
      <Chart
        data={ppfgChartData.chartData}
        axisNames={{
          x: ppfgChartData.xAxisName,
          y: ppfgChartData.yAxisName,
        }}
        axisAutorange={{
          y: 'reversed',
        }}
        title=""
        autosize
      />
    </ChartHolder>
  ) : (
    <MessageWrapper>{t(EMPTY_CHART_DATA_MESSAGE)}</MessageWrapper>
  );
};
